"""
WebSocket 連接與事件處理測試 (Green Stage - Final Fix v3)
"""

import pytest
import json
import uuid
import time
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

# 模擬資料
TEST_TOKEN = "valid_test_token"
TEST_USER_ID = str(uuid.uuid4())
TEST_SESSION_ID = "test_session_123"


@pytest.fixture
def mock_websocket_deps():
    """Mock WebSocket 的所有外部依賴"""
    with (
        patch("app.api.quest_ws.decode_access_token") as mock_decode,
        patch(
            "app.api.quest_ws.get_user_display_name", new_callable=AsyncMock
        ) as mock_get_name,
        patch("app.api.quest_ws.manager") as mock_manager,
        patch(
            "app.api.quest_ws.get_or_create_session", new_callable=AsyncMock
        ) as mock_get_session,
        patch("app.api.quest_ws.AsyncSessionLocal") as mock_db,
        patch("app.api.quest_ws.session_service", new_callable=AsyncMock) as mock_ss,
        patch(
            "app.api.quest_ws.handle_start_quest", new_callable=AsyncMock
        ) as mock_start,
        patch(
            "app.api.quest_ws.handle_submit_answer", new_callable=AsyncMock
        ) as mock_submit,
        patch(
            "app.api.quest_ws.handle_request_result", new_callable=AsyncMock
        ) as mock_result,
    ):

        async def mock_connect(sid, ws):
            await ws.accept()
            # 必須真的放入以維持 manager 行為
            mock_manager.active_connections[sid] = ws

        mock_manager.connect = AsyncMock(side_effect=mock_connect)
        mock_manager.disconnect = MagicMock()
        mock_manager.send_event = AsyncMock()
        mock_manager.active_connections = {}

        mock_decode.return_value = {"sub": TEST_USER_ID}
        mock_get_name.return_value = "測試玩家"

        mock_quest_session = MagicMock()
        mock_quest_session.state = {"current_quest_id": "mbti"}
        mock_ss.get_session.return_value = mock_quest_session

        mock_db_instance = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_db_instance
        mock_user_result = MagicMock()
        mock_user_result.scalar_one_or_none.return_value = MagicMock(level=1, exp=0)
        mock_db_instance.execute.return_value = mock_user_result

        yield {
            "decode": mock_decode,
            "get_name": mock_get_name,
            "manager": mock_manager,
            "get_session": mock_get_session,
            "db": mock_db,
            "ss": mock_ss,
            "handle_start": mock_start,
            "handle_submit": mock_submit,
            "handle_result": mock_result,
        }


def test_websocket_connect_success(mock_websocket_deps):
    """測試 WebSocket 正常連接"""
    client = TestClient(app)
    with client.websocket_connect(
        f"/v1/quests/ws?sessionId={TEST_SESSION_ID}",
        subprotocols=["Bearer", TEST_TOKEN],
    ) as websocket:
        mock_websocket_deps["manager"].connect.assert_called_once()
    mock_websocket_deps["manager"].disconnect.assert_called_with(TEST_SESSION_ID)


def test_websocket_connect_missing_token(mock_websocket_deps):
    """測試缺少 Token 時連接應失敗"""
    client = TestClient(app)
    mock_websocket_deps["decode"].return_value = None
    with pytest.raises(Exception):
        with client.websocket_connect(
            f"/v1/quests/ws?sessionId={TEST_SESSION_ID}"
        ) as websocket:
            pass


def test_websocket_event_start_quest(mock_websocket_deps):
    """測試 start_quest 事件處理"""
    client = TestClient(app)
    mock_websocket_deps["handle_start"].return_value = {"question": "第一題"}

    with client.websocket_connect(
        f"/v1/quests/ws?sessionId={TEST_SESSION_ID}",
        subprotocols=["Bearer", TEST_TOKEN],
    ) as websocket:
        websocket.send_json({"event": "start_quest", "data": {"questId": "enneagram"}})

        # 關鍵：給背景線程一點時間執行完成
        # 由於 TestClient 是同步 client，send_json 後 app 側正在異步處理
        for _ in range(10):
            if mock_websocket_deps["handle_start"].called:
                break
            time.sleep(0.05)

        mock_websocket_deps["handle_start"].assert_called_once()
        mock_websocket_deps["manager"].send_event.assert_awaited_with(
            TEST_SESSION_ID, "next_question", {"question": "第一題"}
        )


def test_websocket_event_submit_answer(mock_websocket_deps):
    """測試 submit_answer 事件處理"""
    client = TestClient(app)
    mock_websocket_deps["handle_submit"].return_value = {
        "event": "next_question",
        "data": {"question": "第二題"},
    }

    with client.websocket_connect(
        f"/v1/quests/ws?sessionId={TEST_SESSION_ID}",
        subprotocols=["Bearer", TEST_TOKEN],
    ) as websocket:
        websocket.send_json(
            {"event": "submit_answer", "data": {"answer": "A", "questionIndex": 0}}
        )

        for _ in range(10):
            if mock_websocket_deps["handle_submit"].called:
                break
            time.sleep(0.05)

        mock_websocket_deps["handle_submit"].assert_called_once()
        mock_websocket_deps["manager"].send_event.assert_awaited_with(
            TEST_SESSION_ID, "next_question", {"question": "第二題"}
        )


def test_websocket_error_handling(mock_websocket_deps):
    """測試錯誤處理與異常捕捉"""
    client = TestClient(app)
    mock_websocket_deps["handle_start"].side_effect = Exception("測試引爆錯誤")

    with client.websocket_connect(
        f"/v1/quests/ws?sessionId={TEST_SESSION_ID}",
        subprotocols=["Bearer", TEST_TOKEN],
    ) as websocket:
        websocket.send_json({"event": "start_quest", "data": {"questId": "mbti"}})

        for _ in range(10):
            if mock_websocket_deps["manager"].send_event.called:
                break
            time.sleep(0.05)

        mock_websocket_deps["manager"].send_event.assert_awaited_with(
            TEST_SESSION_ID, "error", {"message": "測試引爆錯誤"}
        )
