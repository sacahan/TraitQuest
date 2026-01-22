import json
import logging
import uuid
from fastapi import APIRouter, WebSocket, Query
from sqlalchemy import select

from app.core.security import decode_access_token
from app.core.session import session_service
from app.db.session import AsyncSessionLocal
from app.db.models import User

from app.api.quest_utils import (
    get_user_display_name,
    get_or_create_session,
    manager,
    QUESTIONNAIRE_NAME,
)
from app.api.quest_ws_handlers import (
    handle_start_quest,
    handle_submit_answer,
    handle_request_result,
)

logger = logging.getLogger("app")

router = APIRouter(prefix="/quests", tags=["quests"])


@router.websocket("/ws")
async def quest_ws_endpoint(websocket: WebSocket, sessionId: str = Query(...)):
    """
    WebSocket 主入口：處理玩家的即時測驗流程

    流程：
    1. 驗證 JWT Token
    2. 建立 WebSocket 連線
    3. 進入無限迴圈處理前端事件 (Event Loop)
    """

    auth_header = websocket.headers.get("sec-websocket-protocol")
    if not auth_header:
        await websocket.close(code=1008, reason="Missing Authorization")
        return

    protocols = [p.strip() for p in auth_header.split(",")]
    if len(protocols) < 2 or protocols[0] != "Bearer":
        await websocket.close(code=1008, reason="Invalid Authorization Protocol")
        return

    token = protocols[1]
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid Token")
        return

    user_id = payload.get("sub") or "test_user"
    display_name = await get_user_display_name(user_id)

    await manager.connect(sessionId, websocket)

    try:
        await get_or_create_session(
            app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId
        )

        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            event_type = data.get("event")
            payload = data.get("data", {})

            async with AsyncSessionLocal() as db_session:
                user_stmt = select(User).where(User.id == uuid.UUID(user_id))
                user_result = await db_session.execute(user_stmt)
                user = user_result.scalar_one_or_none()
                player_level = user.level if user else 1
                player_exp = user.exp if user else 0

            questionnaire_session = await session_service.get_session(
                app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId
            )
            quest_id = questionnaire_session.state.get("current_quest_id", "mbti")

            logger.info(
                f"📥 [{event_type}]: Lv.{player_level}, Quest: {quest_id} ({sessionId})"
            )

            if event_type == "start_quest":
                quest_id = payload.get("questId", "mbti")
                result = await handle_start_quest(
                    session_id=sessionId,
                    quest_id=quest_id,
                    user_id=user_id,
                    player_level=player_level,
                    display_name=display_name,
                    questionnaire_session=questionnaire_session,
                )
                await manager.send_event(sessionId, "next_question", result)

            elif event_type == "submit_answer":
                answer = payload.get("answer")
                question_index = payload.get("questionIndex", 0)
                handler_result = await handle_submit_answer(
                    session_id=sessionId,
                    answer=answer,
                    question_index=question_index,
                    user_id=user_id,
                    quest_id=quest_id,
                    player_level=player_level,
                    display_name=display_name,
                    questionnaire_session=questionnaire_session,
                )
                await manager.send_event(
                    sessionId, handler_result["event"], handler_result["data"]
                )

            elif event_type == "request_result":
                handler_result = await handle_request_result(
                    session_id=sessionId,
                    quest_id=quest_id,
                    user_id=user_id,
                    player_level=player_level,
                    player_exp=player_exp,
                    display_name=display_name,
                    questionnaire_session=questionnaire_session,
                )
                await manager.send_event(
                    sessionId, handler_result["event"], handler_result["data"]
                )

    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}")
        # Only try to send error if session is still connected
        if sessionId in manager.active_connections:
            try:
                await manager.send_event(sessionId, "error", {"message": str(e)})
            except Exception as send_error:
                logger.error(f"Failed to send error message: {send_error}")
    finally:
        manager.disconnect(sessionId)
