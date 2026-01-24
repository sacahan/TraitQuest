"""
API 端點整合測試 (Green Stage - Final)
"""

import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 模擬資料
TEST_USER_ID = str(uuid.uuid4())
TEST_TOKEN = "valid_token"


@pytest.fixture
def mock_auth():
    with patch("app.api.quest.decode_access_token") as mock:
        mock.return_value = {"sub": TEST_USER_ID}
        yield mock


@pytest.fixture
def mock_db():
    with patch("app.db.session.AsyncSessionLocal") as mock_session_local:
        mock_instance = AsyncMock()
        mock_session_local.return_value.__aenter__.return_value = mock_instance
        yield mock_instance


def test_get_report_unauthorized():
    """測試未帶 Token 存取報告端點"""
    response = client.get("/v1/quests/report/mbti")
    assert response.status_code == 401


def test_get_report_success(mock_auth, mock_db):
    """測試正常獲取測驗報告 (符合 Schema)"""
    mock_quest = MagicMock()
    mock_quest.quest_type = "mbti"
    mock_quest.quest_report = {
        "class_id": "CLS_INTJ",
        "race_id": "RACE_5",
        "stats": {
            "STA_O": 80,
            "STA_C": 70,
            "STA_E": 60,
            "STA_A": 75,
            "STA_N": 60,
        },
        "destiny_guide": {
            "daily": "預言",
            "main": "主線",
            "side": "支線",
            "oracle": "神諭",
        },
        "level_info": {
            "level": 1,
            "exp": 100,
            "earnedExp": 50,
            "isLeveledUp": False,
            "expToNextLevel": 300,
            "expProgress": 0.33,
        },
    }
    mock_quest.hero_chronicle = "你的靈魂覺醒了。"
    mock_quest.completed_at = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_quest
    mock_db.execute.return_value = mock_result

    response = client.get(
        "/v1/quests/report/mbti", headers={"Authorization": f"Bearer {TEST_TOKEN}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["class_id"] == "CLS_INTJ"
    assert data["stats"]["STA_O"] == 80


def test_get_report_not_found(mock_auth, mock_db):
    """測試找不到報告的情況"""
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    response = client.get(
        "/v1/quests/report/mbti", headers={"Authorization": f"Bearer {TEST_TOKEN}"}
    )

    assert response.status_code == 404
