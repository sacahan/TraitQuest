"""
Session State 同步問題 Debug 測試

此測試驗證 tool_context.state 的變更是否能透過 session_service.get_session 取回
"""
import asyncio
import logging
from google.adk.runners import Runner
from google.adk.tools.tool_context import ToolContext
from google.genai import types
from app.core.session import session_service
from app.agents.questionnaire import questionnaire_agent

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def test_session_state_sync():
    """測試 Session State 是否正確同步"""
    
    app_name = "questionnaire"
    user_id = "test_user_123"
    session_id = "test_session_456"
    
    # 1. 建立 Session
    logger.info("=== Step 1: Creating session ===")
    session = await session_service.create_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id
    )
    logger.info(f"Session created. Initial state: {session.state}")
    
    # 2. 建立 Runner 並執行 Agent
    logger.info("=== Step 2: Running Agent ===")
    runner = Runner(
        agent=questionnaire_agent,
        app_name=app_name,
        session_service=session_service
    )
    
    instruction = "玩家 TestUser (等級 1)，開啟了 mbti 試煉。本次試煉總題數設定為 3 題。請生成一個符合 mbti 試煉情境的開場白，並直接提供第一道題目與選項。"
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=user_msg
    ):
        if event.actions and event.actions.state_delta:
            logger.info(f"  Event state_delta: {event.actions.state_delta}")
        if event.actions and event.actions.end_of_agent:
            logger.info("  Agent ended")
            break
    
    # 3. 嘗試從 Session Service 取回 State
    logger.info("=== Step 3: Fetching session after Agent run ===")
    updated_session = await session_service.get_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id
    )
    
    logger.info(f"Updated session state keys: {list(updated_session.state.keys()) if updated_session.state else 'EMPTY'}")
    
    questionnaire_output = updated_session.state.get("questionnaire_output", {})
    logger.info(f"questionnaire_output: {questionnaire_output}")
    
    # 4. 驗證
    if questionnaire_output:
        logger.info("✅ SUCCESS: questionnaire_output found in session state!")
    else:
        logger.error("❌ FAIL: questionnaire_output NOT found in session state!")
        
        # Debug: 檢查 storage 內部狀態
        logger.info("=== Debug: Checking internal storage ===")
        if hasattr(session_service, 'sessions'):
            storage = session_service.sessions.get(app_name, {}).get(user_id, {}).get(session_id)
            if storage:
                logger.info(f"Storage session state: {storage.state}")
                logger.info(f"Storage session events count: {len(storage.events)}")
                for i, evt in enumerate(storage.events):
                    if evt.actions and evt.actions.state_delta:
                        logger.info(f"  Event {i} state_delta: {evt.actions.state_delta}")
            else:
                logger.error("Storage session not found!")

if __name__ == "__main__":
    asyncio.run(test_session_state_sync())
