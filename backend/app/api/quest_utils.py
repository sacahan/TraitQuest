import json
import logging
import asyncio
import uuid
from typing import Dict, List, Optional, Any

from fastapi import WebSocket
from sqlalchemy import select, update, func

from app.core.redis_client import redis_client
from app.core.copilot_client import copilot_manager
from app.core.copilot_logging import setup_copilot_logging
from app.services.cache_service import CacheService
from app.services.level_system import level_service
from app.services.game_assets import game_assets_service
from app.db.session import AsyncSessionLocal
from app.db.models import User, UserQuest, GameDefinition

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
        # Accept WebSocket connection with the Bearer subprotocol
        # This is required because the frontend sends: ['Bearer', token]
        await websocket.accept(subprotocol="Bearer")
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
            websocket = self.active_connections[session_id]
            # Check if WebSocket is actually connected before sending
            try:
                from starlette.websockets import WebSocketState

                if websocket.client_state != WebSocketState.CONNECTED:
                    logger.warning(
                        f"⚠️ WebSocket {session_id} not in CONNECTED state, skipping send"
                    )
                    return

                message = {"event": event, "data": data}
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send event to {session_id}: {e}")


manager = ConnectionManager()


__all__ = [
    "run_questionnaire_agent",
    "run_analytics_task",
    "run_copilot_transformation_agent",
    "run_copilot_summary_agent",
    "get_user_display_name",
    "run_agent_async",
    "get_or_create_session",
    "manager",
    "QUESTIONNAIRE_NAME",
    "get_total_steps",
    "get_hero_chronicle",
]


# =============================================================================
# Copilot SDK Agent 執行器
# =============================================================================


async def run_copilot_questionnaire_agent(
    user_id: str,
    session_id: str,
    instruction: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Questionnaire Agent

    Args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        instruction: 輸入給 Agent 的指令文字

    Returns:
        Dict: 包含 narrative (敘事), question (題目), guideMessage (引導) 的標準化字典
    """
    from app.agents.copilot_questionnaire import (
        get_questionnaire_session_id,
        create_questionnaire_tools,
        QUESTIONNAIRE_INSTRUCTION,
    )
    from app.core.tools import ToolOutputCapture

    logger.debug(f"🔄 [run_copilot_questionnaire_agent] Starting cycle for session {session_id}")

    copilot_session_id = get_questionnaire_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_questionnaire_tools(),
            system_message=QUESTIONNAIRE_INSTRUCTION + f"\n當前玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    logger.debug(f"🏁 Questionnaire output: {result}")

    narrative = result.get("narrative", "")
    question_data = result.get("question")
    guide_message = result.get("guideMessage", "")

    return {
        "narrative": narrative,
        "question": question_data,
        "guideMessage": guide_message,
    }


async def run_copilot_analytics_agent(
    user_id: str,
    session_id: str,
    instruction: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Analytics Agent

    Args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        instruction: 輸入給 Agent 的指令文字

    Returns:
        Dict: Analytics 結果
    """
    from app.agents.copilot_analytics import (
        get_analytics_session_id,
        create_analytics_tools,
        ANALYTICS_INSTRUCTION,
    )
    from app.core.tools import ToolOutputCapture

    copilot_session_id = get_analytics_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_analytics_tools(),
            system_message=ANALYTICS_INSTRUCTION + f"\n當前玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    logger.debug(f"🧠 Analytics output: {result}")
    return result


async def run_copilot_transformation_agent(
    user_id: str,
    session_id: str,
    instruction: str,
    quest_type: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Transformation Agent

    Args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        instruction: 輸入給 Agent 的指令文字
        quest_type: 測驗類型

    Returns:
        Dict: Transformation 結果
    """
    from app.agents.copilot_transformation import (
        get_transformation_session_id,
        create_transformation_tools,
        TRANSFORMATION_INSTRUCTION,
    )
    from app.core.tools import ToolOutputCapture

    copilot_session_id = get_transformation_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_transformation_tools(),
            system_message=TRANSFORMATION_INSTRUCTION + f"\n當前測驗類型: {quest_type}，玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    logger.debug(f"🧙‍♂️ Transformation output: {result}")
    return result


async def run_copilot_summary_agent(
    user_id: str,
    session_id: str,
    instruction: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Summary Agent

    Args:
        user_id: 玩家 ID
        session_id: WebSocket Session ID
        instruction: 輸入給 Agent 的指令文字

    Returns:
        Dict: Summary 結果
    """
    from app.agents.copilot_summary import (
        get_summary_session_id,
        create_summary_tools,
        SUMMARY_INSTRUCTION,
    )
    from app.core.tools import ToolOutputCapture

    copilot_session_id = get_summary_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_summary_tools(),
            system_message=SUMMARY_INSTRUCTION + f"\n當前玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    logger.debug(f"📜 Summary output: {result}")
    return result


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
        logger.debug(
            f"💾 [Redis Cache Hit] display_name for {user_id[:8]}... = {cached_name}"
        )
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
                logger.debug(
                    f"🗄️ [DB Query] display_name for {user_id[:8]}... = {display_name}"
                )
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


async def get_or_create_session(
    app_name: str, user_id: str, session_id: str
) -> Any:
    """
    確保獲取有效的 Session（Copilot SDK 版本）

    Copilot SDK 的 session 由 copilot_manager 管理
    """
    return await copilot_manager.get_session(
        session_id=f"{app_name}_{user_id}_{session_id}",
    )


# =============================================================================
# Quest Logic Helpers
# =============================================================================


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
    它會啟動一個獨立 Analytics Agent 用於分析玩家回答的心理特徵，
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

        # 使用 Copilot SDK 執行 Analytics Agent
        result = await run_copilot_analytics_agent(user_id, session_id, instruction)
        logger.info(f"🧠 [Background] Result: {result}")

        if result:
            await CacheService.set_analytics_result(session_id, result)

            # [FIX] 將單次分析結果存回主 Session 以供後續聚合 (Aggregation)
            from app.core.session import session_service

            session = await session_service.get_session(
                QUESTIONNAIRE_NAME, user_id, session_id
            )
            if session:
                if "accumulated_analytics" not in session.state:
                    session.state["accumulated_analytics"] = []
                session.state["accumulated_analytics"].append(result)
                await session_service.update_session(session)

            logger.debug(
                f"✅ [Background] Analysis complete for {session_id}: {result.get('quality_score', 'N/A')}"
            )

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


async def get_analytics_for_quests(
    db: AsyncSessionLocal, user_id: str, quest_types: list[str]
) -> dict[str, list[UserQuest]]:
    """
    批量獲取指定類型測驗的分析結果，使用 IN 查詢取代迴圈中的多次查詢

    此函式避免 N+1 查詢問題，透過單一 SQL 查詢獲取所有相關的 UserQuest 記錄。
    使用 IN 子子過濾 quest_type，而非在 Python 迴圈中進行多次查詢。

    Args:
        db: 資料庫會話 (AsyncSession)
        user_id: 使用者 ID (UUID 字串格式)
        quest_types: 測驗類型列表 (例如: ["mbti", "bigfive", "enneagram"])

    Returns:
        dict[str, list[UserQuest]]: 按 quest_type 分組的測驗記錄字典

    Example:
        >>> analytics_by_type = await get_analytics_for_quests(
        ...     db, user_id, ["mbti", "bigfive", "enneagram"]
        ... )
        >>> mbti_quests = analytics_by_type.get("mbti", [])
    """
    # 單一查詢獲取所有相關的 UserQuest 記錄
    stmt = (
        select(UserQuest)
        .where(
            UserQuest.user_id == uuid.UUID(user_id),
            UserQuest.quest_type.in_(quest_types),
            UserQuest.completed_at.isnot(None),
        )
        .order_by(UserQuest.completed_at.desc())
    )

    result = await db.execute(stmt)
    all_quests = result.scalars().all()

    # 在記憶體中按 quest_type 分組（避免在 DB 層級分組的複雜性）
    grouped: dict[str, list[UserQuest]] = {}
    for quest in all_quests:
        quest_type = quest.quest_type
        if quest_type not in grouped:
            grouped[quest_type] = []
        grouped[quest_type].append(quest)

    return grouped


async def run_questionnaire_agent(
    user_id: str, session_id: str, instruction: str
) -> dict:
    """
    使用 Copilot SDK 執行 Questionnaire Agent
    """
    return await run_copilot_questionnaire_agent(user_id, session_id, instruction)


async def run_agent_async(
    agent,
    app_name: str,
    user_id: str,
    session_id: str,
    instruction: str,
    output_key: str,
) -> dict:
    """
    相容舊版的 run_agent_async 呼叫，轉發到對應的 Copilot 執行器
    """
    if app_name == "summary":
        return await run_copilot_summary_agent(user_id, session_id, instruction)
    elif app_name == "transformation":
        # 注意：這裡需要 quest_type，嘗試從 session 獲取或使用預設
        return await run_copilot_transformation_agent(user_id, session_id, instruction, "mbti")
    
    return {}
