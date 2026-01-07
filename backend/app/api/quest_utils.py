import json
import logging
import asyncio
import uuid
from typing import Dict, List, Optional, Any

from fastapi import WebSocket
from sqlalchemy import select, update, func

from app.core.session import session_service
from app.core.redis_client import redis_client
from app.agents.questionnaire import questionnaire_agent
from app.agents.analytics import analytics_agent, create_analytics_agent
from app.agents.transformation import transformation_agent
# Removed validator_agent import
from app.agents.summary import summary_agent
from app.services.level_system import level_service
from app.services.game_assets import game_assets_service
from app.db.session import AsyncSessionLocal
from app.db.models import User, UserQuest, GameDefinition
from google.adk.runners import Runner
from google.adk.sessions.session import Session
from google.genai import types

logger = logging.getLogger("app")

# 主 Session 命名空間（用於 Questionnaire Agent 及共享狀態）
QUESTIONNAIRE_NAME = "questionnaire"

# =============================================================================
# Connection Manager
# =============================================================================

class ConnectionManager:
    """管理 WebSocket 連線"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.pending_tasks: Dict[str, List[asyncio.Task]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.pending_tasks[session_id] = []
        logger.info(f"🔌 WebSocket Connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.pending_tasks:
            # Note: Background tasks should ideally be allowed to finish or handled gracefully
            del self.pending_tasks[session_id]
        logger.info(f"🔌 WebSocket Disconnected: {session_id}")

    async def send_event(self, session_id: str, event: str, data: dict):
        if session_id in self.active_connections:
            try:
                message = {"event": event, "data": data}
                await self.active_connections[session_id].send_json(message)
            except Exception as e:
                logger.error(f"Failed to send event to {session_id}: {e}")

manager = ConnectionManager()


# =============================================================================
# Display Name Query (玩家名稱查詢 - Redis 快取版本)
# =============================================================================

async def get_user_display_name(user_id: str) -> str:
    """
    查詢使用者的 display_name（使用 Redis 快取）
    
    此函式會優先從 Redis 讀取，若快取未命中，則查詢資料庫並更新 Redis 快取。
    符合開發憲章第二條：使用 Redis 作為緩存策略，支援分散式部署。
    
    Args:
        user_id: 使用者 ID (UUID 字串格式)
        
    Returns:
        str: 使用者的 display_name，若未找到則返回 "Unknown User"
    """
    # 1. 嘗試從 Redis 快取讀取
    cached_name = await redis_client.get_display_name(user_id)
    if cached_name:
        logger.debug(f"💾 [Redis Cache Hit] display_name for {user_id[:8]}... = {cached_name}")
        return cached_name
    
    # 2. 快取未命中，查詢資料庫
    async with AsyncSessionLocal() as db_session:
        try:
            stmt = select(User.display_name).where(User.id == uuid.UUID(user_id))
            result = await db_session.execute(stmt)
            display_name = result.scalar_one_or_none()
            
            if display_name:
                # 3. 存入 Redis 快取（TTL: 30 分鐘）
                await redis_client.set_display_name(user_id, display_name)
                logger.debug(f"🗄️ [DB Query] display_name for {user_id[:8]}... = {display_name}")
                return display_name
            else:
                logger.warning(f"⚠️ User {user_id} not found in database")
                return "Noname"
                
        except Exception as e:
            logger.error(f"❌ Error fetching display_name for {user_id}: {e}")
            return "Noname"


# =============================================================================
# Session 管理工具 (Session Helpers)
# =============================================================================

async def get_or_create_session(app_name: str, user_id: str, session_id: str) -> Session:
    """
    確保獲取有效的 Session。
    
    流程：
    1. 嘗試 get_session。
    2. 若失敗（不存在），則執行 create_session。
    
    符合開發憲章第七條：Agent Output Key 隔離原則，確保各 Agent 命名空間獨立。
    """
    try:
        session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)
        if session:
            return session
    except Exception:
        # get_session 可能在 Session 不存在時拋出異常
        pass
    
    # 建立新 Session
    logger.info(f"🆕 Creating new session for app: {app_name}, session_id: {session_id}")
    return await session_service.create_session(app_name=app_name, user_id=user_id, session_id=session_id)


# =============================================================================
# 通用 Agent 執行器 (Unified Agent Runner)
# =============================================================================

async def run_agent_async(
    agent,
    app_name: str,
    user_id: str,
    session_id: str,
    instruction: str,
    output_key: str
) -> dict:
    """
    通用 Agent 執行器：統一處理 Session 建立、Runner 執行與結果讀取
    
    此函式封裝了所有 Agent 執行的共同邏輯，消除 quest_ws.py 中重複的程式碼。
    
    Args:
        agent: Agent 實例（如 questionnaire_agent、analytics_agent 等）
        app_name: Session 命名空間（每個 Agent 應有獨立的 namespace）
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        instruction: 傳給 Agent 的指令文字
        output_key: Agent 將結果寫入 session.state 的 key 名稱
        
    Returns:
        dict: Agent 執行後存入 session.state[output_key] 的結果
    """
    # 1. 確保 Session 存在
    session = await get_or_create_session(
        app_name=app_name, 
        user_id=user_id, 
        session_id=session_id
    )
    
    # 2. 建立 Runner 並準備訊息
    runner = Runner(agent=agent, app_name=app_name, session_service=session_service)
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    
    # 3. 執行 Agent 對話循環
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=user_msg):
        if event.actions and event.actions.end_of_agent:
            break
    
    # 4. 從 Session State 讀取結果
    # [Fix] 重新獲取 Session 以取得最新狀態，因為 Runner 執行過程中
    # tool_context.state 的變更可能未反映在原 session 物件引用上
    session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)
    result = session.state.get(output_key, {})
    
    # 5. 安全解析（防止 Agent 回傳字串而非物件）
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            result = {}
    
    logger.debug(f"🚀 App: {app_name}, Agent: {agent.name}, Result: {result}")

    return result

async def run_analytics_task(
    user_id: str,
    session_id: str,
    question_text: str,
    answer: str,
    test_category: str,
    options: list = None,
    question_type: str = "QUANTITATIVE",
):
    """
    背景任務：執行 Analytics Agent 並將分析結果存入 Session

    此函式被設計為 Fire-and-forget 的背景任務，避免阻塞主對話流程。
    它會啟動一個獨立的 Analytics Agent 用於分析玩家回答的心理特徵，
    並將結果存入 Session State 的 `accumulated_analytics` 列表中，供最終結算使用。

    Args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        question_text: 題目文字
        answer: 答案
        test_category: 測驗範疇
        options: 選項列表（可選）
        question_type: 題型（預設 QUANTITATIVE）
    """
    try:
        logger.debug(f"🧠 [Background] Starting AI analysis for session {session_id}")
        
        # 組合指令
        instruction = f"題目：{question_text}\n"
        if options:
            instruction += f"選項：{json.dumps(options, ensure_ascii=False)}\n"
        instruction += f"玩家回答：{answer}\n"
        instruction += f"測驗範疇：{test_category}\n"
        instruction += f"題型：{question_type}"
        
        logger.info(f"🧠 [Background] Instruction: {instruction}")   
        # 使用通用執行器執行 Analytics Agent
        result = await run_agent_async(
            agent=analytics_agent,
            app_name="analytics",
            user_id=user_id,
            session_id=session_id,
            instruction=instruction,
            output_key="analytics_output"
        )
        logger.info(f"🧠 [Background] Result: {result}")
        
        if result:
            # 將單次分析結果存回主 Session 以供後續聚合 (Aggregation)
            # 這是 "Map-Reduce" 模式中的 Map 階段結果收集
            # [Fix] 重新獲取最新 session 以避免 Race Condition
            # 因為多個 analytics task 可能同時執行，使用傳入的舊 session 引用會導致資料覆蓋
            main_session = await session_service.get_session(
                app_name=QUESTIONNAIRE_NAME, 
                user_id=user_id, 
                session_id=session_id
            )
            
            if "accumulated_analytics" not in main_session.state:
                main_session.state["accumulated_analytics"] = []
            main_session.state["accumulated_analytics"].append(result)
            
            # 顯式保存 session state
            await session_service.update_session(main_session)
            
            logger.debug(f"✅ [Background] Analysis complete for {session_id}: {result.get('quality_score', 'N/A')}")
            
    except Exception as e:
        logger.error(f"Error in background analytics task: {e}")


# =============================================================================
# Quest Logic Helpers
# =============================================================================

# 基礎題數配置（用於參考，實際計算由 level_service 處理）
BASE_STEPS = {
    "mbti": 10,
    "bigfive": 15,
    "disc": 10,
    "enneagram": 10,
    "gallup": 10,
}

def get_total_steps(quest_id: str, level: int = 1) -> int:
    """
    根據測驗類型與玩家等級動態計算總題數。
    
    規則（由 level_service.get_question_count 統一管理）：
    - Lv.1-14: 10 題
    - Lv.15-19: 15 題
    - Lv.20+: 20 題
    """
    return level_service.get_question_count(level)


async def get_hero_chronicle(user_id: str) -> str:
    """
    從資料庫讀取玩家的 hero_chronicle（長期記憶摘要）
    
    此摘要由 Summary Agent 生成，用於維持跨測驗的敘事連貫性。
    當 Questionnaire Agent 生成新題目時，會參考此摘要來維持角色的「靈魂一致性」。
    
    Args:
        user_id: 玩家 ID
        
    Returns:
        str: hero_chronicle 摘要文字，若無則返回空字串
    """
    async with AsyncSessionLocal() as db_session:
        # 查詢該玩家最近一次已完成的測驗記錄
        stmt = (
            select(UserQuest.hero_chronicle)
            .where(UserQuest.user_id == uuid.UUID(user_id))
            .where(UserQuest.hero_chronicle.isnot(None))
            .order_by(UserQuest.created_at.desc())
            .limit(1)
        )
        result = await db_session.execute(stmt)
        chronicle = result.scalar_one_or_none()
        return chronicle if chronicle else ""





async def run_questionnaire_agent(user_id: str, session_id: str, instruction: str) -> dict:
    """
    [核心邏輯] 執行 Questionnaire Agent 對話循環
    
    此函式封裝了 "User Input -> Agent Thinking -> Tool Execution -> Result Parsing" 的完整週期。
    
    關鍵設計：Single Source of Truth
    - 我們不依賴 Agent 的直接文字回應 (return text)。
    - 而是依賴 Agent 執行工具後，寫入 Session State 的 `questionnaire_output` 結構化資料。
    
    Args:
        user_id: 每個使用者的唯一標識 (Sub)
        session_id: 前端生成的 Session ID (用於追踪 WebSocket 連線與狀態)
        instruction: 輸入給 Agent 的文字指令 (User Message)，包含情境描述或玩家回答
        
    Returns:
        dict: 包含 narrative (敘事), question (題目), guideMessage (引導) 的標準化字典
    """
    logger.debug(f"🔄 [run_questionnaire_agent] Starting cycle for session {session_id}")
    
    # 使用通用執行器直接呼叫 Questionnaire Agent
    questionnaire_output = await run_agent_async(
        agent=questionnaire_agent,
        app_name=QUESTIONNAIRE_NAME,
        user_id=user_id,
        session_id=session_id,
        instruction=instruction,
        output_key="questionnaire_output"
    )
    
    logger.debug(f"🏁 Questionnaire output: {questionnaire_output}")
    
    # 格式化輸出
    narrative = questionnaire_output.get("narrative", "")
    question_data = questionnaire_output.get("question")
    guide_message = questionnaire_output.get("guideMessage", "")
    
    return {
        "narrative": narrative,
        "question": question_data,
        "guideMessage": guide_message
    }
