"""
全流程整合測試 (End-to-End Quest Flow - Dependency Injection)
"""

import pytest
import uuid
import time
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.api.quest import oauth2_scheme

# 模擬資料
TEST_USER_ID = str(uuid.uuid4())
TEST_SESSION_ID = "e2e_di_session"
TEST_TOKEN = "e2e_di_token"


@pytest.fixture
def setup_overrides():
    """使用 FastAPI dependency_overrides 進行 Mock 注入"""
    mock_db = AsyncMock()

    # 模擬 User 查詢 (用於等級檢索)
    mock_user = MagicMock()
    mock_user.id = uuid.UUID(TEST_USER_ID)
    mock_user.level = 1
    mock_user.exp = 0
    mock_user.hero_profile = {}

    mock_user_result = MagicMock()
    mock_user_result.scalar_one_or_none.return_value = mock_user
    mock_db.execute.return_value = mock_user_result

    # 覆蓋 get_db
    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    yield mock_db

    app.dependency_overrides.clear()


def test_full_quest_flow_di(setup_overrides):
    """測試測驗流程 (使用 DI 注入)"""
    mock_db = setup_overrides

    # Mock 工具函式與 Agent (這些不是透過 Depends 注入的，仍需 patch)
    with (
        patch("app.api.quest.decode_access_token") as mock_auth_api,
        patch("app.api.quest_ws.decode_access_token") as mock_auth_ws,
        patch("app.api.quest_ws_handlers.AsyncSessionLocal") as mock_db_local,
        patch(
            "app.api.quest_utils.run_copilot_questionnaire_agent",
            new_callable=AsyncMock,
        ) as mock_q,
        patch(
            "app.api.quest_ws_handlers.run_copilot_transformation_agent",
            new_callable=AsyncMock,
        ) as mock_t,
        patch(
            "app.api.quest_ws_handlers.run_copilot_summary_agent",
            new_callable=AsyncMock,
        ) as mock_s,
    ):
        payload = {"sub": TEST_USER_ID}
        mock_auth_api.return_value = payload
        mock_auth_ws.return_value = payload

        # 讓 handlers 裡的 session 也用同一個 mock_db
        mock_db_local.return_value.__aenter__.return_value = mock_db

        mock_q.return_value = {
            "narrative": "開場",
            "question": {"text": "Q1", "options": [{"id": "A", "text": "Opt"}]},
            "guideMessage": "G",
        }
        mock_t.return_value = {
            "class_id": "CLS_INTJ",
            "destiny_guide": {"daily": "D", "main": "M", "side": "S", "oracle": "O"},
            "level_info": {
                "level": 1,
                "exp": 100,
                "earnedExp": 10,
                "isLeveledUp": False,
                "expToNextLevel": 300,
            },
        }
        mock_s.return_value = {"hero_chronicle": "H"}

        client = TestClient(app)

        # Step 1: WebSocket
        with client.websocket_connect(
            f"/v1/quests/ws?sessionId={TEST_SESSION_ID}",
            subprotocols=["Bearer", TEST_TOKEN],
        ) as websocket:
            websocket.send_json({"event": "start_quest", "data": {"questId": "mbti"}})
            websocket.send_json({"event": "request_result", "data": {}})
            time.sleep(0.3)

        # Step 2: HTTP GET Report
        # 模擬最新的 UserQuest
        mock_quest = MagicMock()
        mock_quest.quest_type = "mbti"
        mock_quest.quest_report = mock_t.return_value
        mock_quest.hero_chronicle = "H"
        mock_quest.completed_at = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_quest
        mock_db.execute.return_value = mock_result

        response = client.get(
            "/v1/quests/report/mbti", headers={"Authorization": f"Bearer {TEST_TOKEN}"}
        )

        assert response.status_code == 200
        assert response.json()["class_id"] == "CLS_INTJ"
