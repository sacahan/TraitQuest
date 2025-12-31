import json
import logging
import asyncio
import uuid
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from app.core.security import decode_access_token
from app.core.session import session_service
from app.agents.questionnaire import questionnaire_agent
from app.agents.analytics import analytics_agent, create_analytics_agent
from app.agents.transformation import transformation_agent
from app.agents.validator import validator_agent
from app.agents.summary import summary_agent
from app.services.level_system import level_service
from app.services.game_assets import game_assets_service
from app.models.quest import QuestWSEvent, QuestResponse
from app.db.session import AsyncSessionLocal
from app.db.models import User, UserQuest, Trait, GameDefinition
from sqlalchemy import select, update, func
from google.adk.runners import Runner
from google.genai import types

logger = logging.getLogger("app")


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
    # 1. 確保 Session 存在（若已存在則忽略錯誤）
    try:
        await session_service.create_session(
            app_name=app_name, 
            user_id=user_id, 
            session_id=session_id
        )
    except Exception:
        pass  # Session 已存在，無需處理
    
    # 2. 建立 Runner 並準備訊息
    runner = Runner(agent=agent, app_name=app_name, session_service=session_service)
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    
    # 3. 執行 Agent 對話循環
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=user_msg):
        if event.actions and event.actions.end_of_agent:
            break
    
    # 4. 從 Session State 讀取結果
    session = await session_service.get_session(
        app_name=app_name, 
        user_id=user_id, 
        session_id=session_id
    )
    result = session.state.get(output_key, {})
    
    # 5. 安全解析（防止 Agent 回傳字串而非物件）
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            result = {}
    
    logger.debug(f"🚀 App: {app_name}, Agent: {agent.name}, Result: {result}")

    return result

async def run_analytics_task(user_id: str, session_id: str, question_text: str, answer: str, test_category: str, options: list = None):
    """
    背景任務：執行 Analytics Agent 並將分析結果存入 Session
    
    此函式被設計為 Fire-and-forget 的背景任務，避免阻塞主對話流程。
    它會啟動一個獨立的 Analytics Agent 用於分析玩家回答的心理特徵，
    並將結果存入 Session State 的 `accumulated_analytics` 列表中，供最終結算使用。

    args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        question_text: 題目文字
        answer: 答案
        test_category: 測驗範疇
        options: 選項列表
    """
    try:
        logger.info(f"🧠 [Background] Starting AI analysis for session {session_id}")
        
        # 組合指令
        instruction = f"題目：{question_text}\n"
        if options:
            instruction += f"選項：{json.dumps(options, ensure_ascii=False)}\n"
        instruction += f"玩家回答：{answer}\n測驗範疇：{test_category}"
        
        # 使用通用執行器執行 Analytics Agent
        result = await run_agent_async(
            agent=analytics_agent,
            app_name="analytics",
            user_id=user_id,
            session_id=session_id,
            instruction=instruction,
            output_key="analytics_output"
        )
        
        if result:
            # 將單次分析結果存回主 Session 以供後續聚合 (Aggregation)
            # 這是 "Map-Reduce" 模式中的 Map 階段結果收集
            main_session = await session_service.get_session(
                app_name="questionnaire", 
                user_id=user_id, 
                session_id=session_id
            )
            if "accumulated_analytics" not in main_session.state:
                main_session.state["accumulated_analytics"] = []
            main_session.state["accumulated_analytics"].append(result)
            
            logger.info(f"✅ [Background] Analysis complete for {session_id}: {result.get('quality_score', 'N/A')}")
            
    except Exception as e:
        logger.error(f"Error in background analytics task: {e}")

# 基礎題數配置
BASE_STEPS = {
    "mbti": 10,
    "big_five": 15,
    "disc": 10,
    "enneagram": 10,
    "gallup": 10,
}

def get_total_steps(quest_id: str, level: int = 1) -> int:
    """
    根據測驗類型與玩家等級動態計算總題數。
    
    規則：
    - Lv.1-10: 基礎題數 (快速體驗)
    - Lv.11-20: 1.5 倍題數 (深入探索)
    - Lv.21+: 2 倍題數 (完整解析)
    """
    base = BASE_STEPS.get(quest_id, 10)
    if level <= 10:
        return base
    elif level <= 20:
        return int(base * 1.5)
    else:
        return base * 2


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

router = APIRouter(prefix="/quests", tags=["quests"])

# 主 Session 命名空間（用於 Questionnaire Agent 及共享狀態）
QUESTIONNAIRE_NAME = "questionnaire"

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
    logger.info(f"🔄 User message: {instruction}")
    
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

@router.websocket("/ws")
async def quest_ws_endpoint(
    websocket: WebSocket,
    sessionId: str = Query(...),
    token: str = Query(...)
):
    """
    WebSocket 主入口：處理玩家的即時測驗流程
    
    流程：
    1. 驗證 JWT Token
    2. 建立 WebSocket 連線
    3. 進入無限迴圈處理前端事件 (Event Loop)
    """

    # 1. JWT 身份驗證
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid Token")
        return
    
    user_id = payload.get("sub") or "test_user"
    
    # 2. 建立連線並註冊到 ConnectionManager
    await manager.connect(sessionId, websocket)
    
    try:
        # 初始化 Session (如果是新連線)
        # 確保在開始對話前，Session Service 中已有此 Session 記錄
        try:
            await session_service.create_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
        except Exception as e:
            logger.debug(f"Session already exists or error creating: {e}")

        # 進入訊息處理迴圈 (Event Loop)
        while True:
            # 接收前端消息
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            event_type = data.get("event")
            payload = data.get("data", {})
            
            # 3. 讀取玩家當前狀態 (Level, Exp)
            # 這會影響題目數量與難度
            async with AsyncSessionLocal() as db_session:
                user_stmt = select(User).where(User.id == uuid.UUID(user_id))
                user_result = await db_session.execute(user_stmt)
                user = user_result.scalar_one_or_none()
                player_level = user.level if user else 1
                player_exp = user.exp if user else 0

            # 4. 從 Session 恢復當前任務狀態 (Context Restoration)
            session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
            quest_id = session.state.get("current_quest_id", "mbti")

            logger.info(f"📥 Received event: {event_type} for session {sessionId} (Lv.{player_level}, Quest: {quest_id})")
            
            # --- 處理：開始新測驗 ---
            if event_type == "start_quest":
                quest_id = payload.get("questId", "mbti")
                total_steps = get_total_steps(quest_id, player_level)
                
                # 初始化 Session State
                session.state["current_quest_id"] = quest_id
                session.state["total_steps"] = total_steps
                session.state["accumulated_analytics"] = [] # 清空分析緩衝區
                session.state["interactions"] = [] # 重置對話歷程
                
                # 在資料庫建立 UserQuest 紀錄 (標記測驗開始)
                async with AsyncSessionLocal() as db_session:
                    new_quest = UserQuest(
                        user_id=uuid.UUID(user_id),
                        quest_type=quest_id,
                        interactions=[]
                    )
                    db_session.add(new_quest)
                    await db_session.commit()
                
                # 讀取玩家的歷史記憶摘要（用於維持敘事連貫性）
                hero_chronicle = await get_hero_chronicle(user_id)
                chronicle_context = ""
                if hero_chronicle:
                    chronicle_context = f"\n\n[玩家歷史摘要]：{hero_chronicle}\n"
                
                # 指令：生成具有代入感的開場白 (Intro Narrative)
                instruction = (
                    f"玩家 {user_id} (等級 {player_level})，開啟了 {quest_id} 試煉。 "
                    f"本次試煉總題數設定為 {total_steps} 題。"
                    f"{chronicle_context}"
                    f"請生成一個符合 {quest_id} 試煉情境的開場白，暫時不需生成具體問題。"
                )
                
                result = await run_questionnaire_agent(user_id, sessionId, instruction)
                # 確保第一題前的開場白有臨時 ID (如果是為了 UI 渲染需要)
                if result.get("question") and not result["question"].get("id"):
                    result["question"]["id"] = f"q_start_{sessionId[:8]}"
                
                result["totalSteps"] = total_steps
                await manager.send_event(sessionId, "first_question", result)

            # --- 處理：從開場白進入第一題 ---
            elif event_type == "continue_quest":
                total_steps = get_total_steps(quest_id, player_level)
                
                # 讀取玩家的歷史記憶摘要
                hero_chronicle = await get_hero_chronicle(user_id)
                chronicle_context = ""
                if hero_chronicle:
                    chronicle_context = f"\n[玩家歷史摘要]：{hero_chronicle}\n\n"
                
                instruction = (
                    f"{chronicle_context}"
                    f"玩家 {user_id} 已準備好開始。當前進度：第 1 題 / 共 {total_steps} 題。 "
                    f"請開始為 {quest_id} 測驗生成第一道題的情境與問題/選項。"
                )
                
                result = await run_questionnaire_agent(user_id, sessionId, instruction)
                
                # 補充前端需要的索引資料
                result["questionIndex"] = 0
                result["totalSteps"] = total_steps
                if result.get("question") and not result["question"].get("id"):
                    result["question"]["id"] = f"q_0_{sessionId[:8]}"
                    
                await manager.send_event(sessionId, "next_question", result)

            # --- 處理：玩家提交回答 ---
            elif event_type == "submit_answer":
                answer = payload.get("answer")
                question_index = payload.get("questionIndex", 0)
                
                # 獲取當前題目上下文 (為了給 Analytics Agent 分析使用)
                session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
                current_question_text = ""
                q_output = session.state.get("questionnaire_output", {})
                current_options = []
                if isinstance(q_output, dict):
                    question_data = q_output.get("question", {})
                    current_question_text = question_data.get("text", "")
                    current_options = question_data.get("options", [])

                # 紀錄互動內容到 Session
                if "interactions" not in session.state:
                    session.state["interactions"] = []
                session.state["interactions"].append({
                    "question": q_output.get("question", {}),
                    "answer": answer
                })

                # [平行處理] 啟動後台分析任務 (Non-blocking)
                # 這允許分析與下一題生成同時進行，提升響應速度
                analysis_task = asyncio.create_task(
                    run_analytics_task(user_id, sessionId, current_question_text, answer, quest_id, options=current_options)
                )
                manager.pending_tasks[sessionId].append(analysis_task)
                
                # 計算題號
                # question_index 從 0 開始，所以當前回答的是第 question_index + 1 題
                current_num = question_index + 1
                next_num = current_num + 1
                
                # 判斷是否為最後一題
                if current_num >= total_steps:
                     instruction = (
                         f"玩家對於最後一題（第 {current_num} 題 / 共 {total_steps} 題）的回答是：{answer}。 "
                         f"試煉已達上限，請務必使用 complete_trial 工具結束測驗，並給予一段感性的結語。"
                     )
                else:
                     # 讀取当前 Session 中的對話歷程，作為上下文
                     interactions = session.state.get("interactions", [])
                     recent_context = ""
                     if len(interactions) >= 2:
                         # 取最近 2 題作為上下文
                         recent = interactions[-2:]
                         context_parts = []
                         for i, item in enumerate(recent):
                             q_text = item.get("question", {}).get("text", "")
                             a_text = item.get("answer", "")
                             if q_text:
                                 context_parts.append(f"第{len(interactions)-1+i}題: {q_text} -> 回答: {a_text}")
                         if context_parts:
                             recent_context = f"\n[近期對話上下文]：" + "; ".join(context_parts) + "\n"
                     
                     instruction = (
                         f"{recent_context}"
                         f"玩家對於第 {current_num} 題（共 {total_steps} 題）的回答是：{answer}。 "
                         f"請生成下一題（第 {next_num} 題 / 共 {total_steps} 題）的情境與題目。"
                     )
                
                # 執行 Agent 生成下一題或結語
                result = await run_questionnaire_agent(user_id, sessionId, instruction)
                
                # 檢查 Agent 是否標記了測驗結束 (透過 complete_trial 工具)
                updated_session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
                
                if updated_session.state.get("quest_completed"):
                     # 發送完成訊號，前端將顯示等待轉場動畫
                     await manager.send_event(sessionId, "quest_complete", {
                        "message": updated_session.state.get("final_message", "Hero transformation in progress..."),
                        "totalExp": 100
                    })
                else:
                    # 發送下一題
                    result["questionIndex"] = question_index + 1
                    result["totalSteps"] = total_steps
                    if result.get("question") and not result["question"].get("id"):
                        result["question"]["id"] = f"q_{result['questionIndex']}_{str(uuid.uuid4())[:8]}"
                    
                    await manager.send_event(sessionId, "next_question", result)

            # --- 處理：請求最終結果 (The Grand Mapping) ---
            elif event_type == "request_result":
                """
                最終結算階段 (Aggregation & Transformation)
                1. 等待所有 Analytics Agent 任務完成
                2. 聚合 (Reduce) 所有分析數據
                3. Transformation Agent: 將心理數據映射為遊戲資產
                4. Validator Agent: 驗證資產合法性
                5. Summary Agent: 生成英雄史詩摘要
                6. 寫入資料庫 & 升級
                """
                logger.debug(f"🔮 [request_result] Starting final transformation for session {sessionId}")
                
                # 1. 確保所有背景分析任務已完成
                tasks = manager.pending_tasks.get(sessionId, [])
                if tasks:
                    logger.info(f"⏳ Waiting for {len(tasks)} analytics tasks to finish")
                    await asyncio.gather(*tasks)
                
                # 2. 聚合 (Reduce) 所有分析結果
                session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
                analytics_list = session.state.get("accumulated_analytics", [])
                
                total_quality = 0
                accumulated_deltas = {}
                for item in analytics_list:
                    total_quality += item.get("quality_score", 1.0)
                    deltas = item.get("trait_deltas", {})
                    for tag, val in deltas.items():
                        accumulated_deltas[tag] = accumulated_deltas.get(tag, 0) + val
                
                avg_quality = total_quality / len(analytics_list) if analytics_list else 1.0
                
                # 3. 執行 Transformation Agent (核心映射邏輯)
                logger.info("🧙‍♂️ Running Transformation Agent...")
                truth_list = await game_assets_service.get_truth_list_dump()
                t_instruction = f"累積心理數據：{json.dumps(accumulated_deltas, ensure_ascii=False)}\n合法資產清單：\n{truth_list}"
                
                final_output = await run_agent_async(
                    agent=transformation_agent,
                    app_name="transformation",
                    user_id=user_id,
                    session_id=sessionId,
                    instruction=t_instruction,
                    output_key="transformation_output"
                )
                
                # 4. 執行 Validator Agent (資產安全檢查)
                logger.info("🛡️ Running Validator Agent...")
                v_instruction = f"待檢查結果：{json.dumps(final_output, ensure_ascii=False)}\n資料庫真值清單：{truth_list}"
                
                val_result = await run_agent_async(
                    agent=validator_agent,
                    app_name="validator",
                    user_id=user_id,
                    session_id=sessionId,
                    instruction=v_instruction,
                    output_key="validation_output"
                )
                
                # 處理驗證結果（若為空則預設為成功）
                if not val_result:
                    val_result = {"status": "SUCCESS"}
                
                if val_result.get("status") == "FAIL":
                    logger.warning(f"⚠️ Validation failed: {val_result.get('errors')}. Proceeding with best effort (Phase 2 retry logic simplified).")

                # 5. 執行 Summary Agent (生成史詩摘要)
                logger.info("📝 Running Summary Agent...")
                # 組合對話歷史供摘要使用
                history_text = "\n".join([f"Q: {i.get('question', {}).get('text', '')}\nA: {i.get('answer', '')}" for i in session.state.get("interactions", [])])
                s_instruction = f"對話歷程：\n{history_text}"
                
                summary_result = await run_agent_async(
                    agent=summary_agent,
                    app_name="summary",
                    user_id=user_id,
                    session_id=sessionId,
                    instruction=s_instruction,
                    output_key="summary_output"
                )
                
                # 處理摘要結果（可能是 dict 或 str）
                if isinstance(summary_result, dict):
                    hero_chronicle = summary_result.get("hero_chronicle", f"冒險者 {quest_id} 完成了 {quest_id} 測驗。")
                elif isinstance(summary_result, str) and summary_result:
                    hero_chronicle = summary_result
                else:
                    hero_chronicle = f"冒險者 {quest_id} 完成了 {quest_id} 測驗。"

                # 6. 計算經驗值與升級 (Level Service)
                # 品質分數影響獲得經驗值的加成
                earned_exp = level_service.calculate_exp(avg_quality * (len(analytics_list) / 2)) # 大約每題 10 點
                new_lvl, new_exp, is_up = level_service.check_level_up(player_level, player_exp + earned_exp)
                
                # 7. 持久化存入資料庫
                async with AsyncSessionLocal() as db_session:
                    user_uuid = uuid.UUID(user_id)
                    
                    # 更新用戶等級
                    await db_session.execute(
                        update(User).where(User.id == user_uuid).values(level=new_lvl, exp=new_exp)
                    )
                    
                    # 存入 Trait (英雄面板 - 永久心理測寫)
                    trait_stmt = select(Trait).where(Trait.user_id == user_uuid)
                    trait_res = await db_session.execute(trait_stmt)
                    trait = trait_res.scalar_one_or_none()
                    if trait:
                        trait.final_report = final_output
                    else:
                        db_session.add(Trait(user_id=user_uuid, final_report=final_output))
                    
                    # 存入 UserQuest 紀錄 (包含史詩摘要)
                    quest_stmt = select(UserQuest).where(UserQuest.user_id == user_uuid, UserQuest.quest_type == quest_id).order_by(UserQuest.created_at.desc())
                    quest_res = await db_session.execute(quest_stmt)
                    quest = quest_res.scalar_one_or_none()
                    
                    if quest:
                        quest.hero_chronicle = hero_chronicle
                        quest.completed_at = func.now()
                        logger.info(f"✅ Updated UserQuest for {user_id} with chronicle")
                    else:
                        logger.error(f"❌ UserQuest not found for {user_id} when trying to update chronicle")
                        # Fallback: create new if missing (should not happen if start_quest worked)
                        new_quest_entry = UserQuest(
                            user_id=user_uuid,
                            quest_type=quest_id,
                            interactions=session.state.get("interactions", []),
                            hero_chronicle=hero_chronicle,
                            completed_at=func.now()
                        )
                        db_session.add(new_quest_entry)
                    
                    await db_session.commit()

                # 8. 回傳最終結果給前端
                # 包含升級資訊與里程碑
                final_output["levelInfo"] = {
                    "level": new_lvl,
                    "exp": new_exp,
                    "isLeveledUp": is_up,
                    "earnedExp": earned_exp
                }
                if is_up:
                    milestone = level_service.get_level_milestone(new_lvl)
                    if milestone:
                        final_output["levelInfo"]["milestone"] = milestone
                
                await manager.send_event(sessionId, "final_result", final_output)

    except WebSocketDisconnect:
        manager.disconnect(sessionId)
    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}")
        await manager.send_event(sessionId, "error", {"message": str(e)})
        manager.disconnect(sessionId)
