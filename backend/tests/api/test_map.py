import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock, patch
from app.api.map import get_map_regions
from app.main import app
from app.core.security import create_access_token
import uuid


@pytest.fixture
def auth_headers():
    """建立認證 headers"""
    token = create_access_token(data={"sub": str(uuid.uuid4())})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
async def test_get_map_regions_initial_lock(mock_decode):
    # Mock JWT
    user_id = uuid.uuid4()
    mock_decode.return_value = {"sub": str(user_id)}

    # Mock DB interaction
    mock_session = AsyncMock()

    # Mock User (Lv.1)
    mock_user = MagicMock()
    mock_user.level = 1

    mock_user_res = MagicMock()
    mock_user_res.scalar_one_or_none.return_value = mock_user

    # Mock Completed Quests (empty)
    mock_quest_res = MagicMock()
    mock_quest_res.__iter__.return_value = []

    mock_session.execute.side_effect = [mock_user_res, mock_quest_res]

    # Execute
    result = await get_map_regions(token="fake_token", db=mock_session)

    regions = result["regions"]
    # MBTI should be AVAILABLE (no prerequisite)
    assert regions[0]["id"] == "mbti"
    assert regions[0]["status"] == "AVAILABLE"
    # Big Five should be LOCKED (needs MBTI to be completed)
    assert regions[1]["id"] == "bigfive"
    assert regions[1]["status"] == "LOCKED"

    # Enneagram should be LOCKED (needs Big Five to be completed)
    assert regions[2]["id"] == "enneagram"
    assert regions[2]["status"] == "LOCKED"


@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
async def test_get_map_regions_unlocked_by_quest(mock_decode):
    user_id = uuid.uuid4()
    mock_decode.return_value = {"sub": str(user_id)}
    mock_session = AsyncMock()

    # Mock User (Lv.1)
    mock_user = MagicMock()
    mock_user.level = 1
    mock_user_res = MagicMock()
    mock_user_res.scalar_one_or_none.return_value = mock_user

    # Mock Completed Quests (MBTI completed)
    mock_quest_res = MagicMock()
    mock_quest_res.__iter__.return_value = [("mbti",)]

    mock_session.execute.side_effect = [mock_user_res, mock_quest_res]

    # Execute
    result = await get_map_regions(token="fake_token", db=mock_session)

    regions = result["regions"]
    # MBTI should be CONQUERED
    assert regions[0]["id"] == "mbti"
    assert regions[0]["status"] == "CONQUERED"

    # Enneagram should be LOCKED (Big Five is not completed)
    assert regions[2]["id"] == "enneagram"
    assert regions[2]["status"] == "LOCKED"


@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
async def test_get_map_regions_unauthorized(mock_decode):
    """測試未授權存取 - decode_access_token 返回 None"""
    mock_decode.return_value = None

    # Execute
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as excinfo:
        await get_map_regions(token="invalid_token", db=AsyncMock())

    assert excinfo.value.status_code == 401


@pytest.mark.asyncio
async def test_get_regions_success_via_http(auth_headers):
    """測試透過 HTTP 成功獲取區域"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Mock DB 互動
        from app.db.session import get_db

        mock_session = AsyncMock()

        # Mock User
        mock_user = MagicMock()
        mock_user.level = 1
        mock_user_res = MagicMock()
        mock_user_res.scalar_one_or_none.return_value = mock_user

        # Mock Completed Quests (empty)
        mock_quest_res = MagicMock()
        mock_quest_res.__iter__.return_value = []

        mock_session.execute.side_effect = [mock_user_res, mock_quest_res]

        # Override get_db dependency
        app.dependency_overrides[get_db] = lambda: mock_session

        try:
            # 執行 HTTP 請求
            response = await client.get("/v1/map/regions", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "regions" in data
            assert isinstance(data["regions"], list)
        finally:
            app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
async def test_get_regions_with_multiple_completed_quests(mock_decode):
    """測試多個測驗完成後的區域狀態"""
    user_id = uuid.uuid4()
    mock_decode.return_value = {"sub": str(user_id)}
    mock_session = AsyncMock()

    # Mock User (Lv.1)
    mock_user = MagicMock()
    mock_user.level = 1
    mock_user_res = MagicMock()
    mock_user_res.scalar_one_or_none.return_value = mock_user

    # Mock Completed Quests (MBTI, Big Five, Enneagram)
    mock_quest_res = MagicMock()
    mock_quest_res.__iter__.return_value = [("mbti",), ("bigfive",), ("enneagram",)]

    mock_session.execute.side_effect = [mock_user_res, mock_quest_res]

    # Execute
    result = await get_map_regions(token="fake_token", db=mock_session)

    regions = result["regions"]

    # 驗證已完成區域的狀態
    mbti_region = next((r for r in regions if r["id"] == "mbti"), None)
    bigfive_region = next((r for r in regions if r["id"] == "bigfive"), None)
    enneagram_region = next((r for r in regions if r["id"] == "enneagram"), None)
    disc_region = next((r for r in regions if r["id"] == "disc"), None)

    assert mbti_region is not None
    assert mbti_region["status"] == "CONQUERED"

    assert bigfive_region is not None
    assert bigfive_region["status"] == "CONQUERED"

    assert enneagram_region is not None
    assert enneagram_region["status"] == "CONQUERED"

    # DISC 應該因 Enneagram 完成而可用
    assert disc_region is not None
    assert disc_region["status"] == "AVAILABLE"

    # Gallup 應該因 DISC 尚未完成而 LOCKED
    gallup_region = next((r for r in regions if r["id"] == "gallup"), None)
    assert gallup_region is not None
    assert gallup_region["status"] == "LOCKED"
