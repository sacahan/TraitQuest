import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import status
from app.api.map import get_map_regions

@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
@patch("app.api.map.AsyncSessionLocal")
async def test_get_map_regions_initial_lock(mock_session_factory, mock_decode):
    # Mock JWT
    mock_decode.return_value = {"sub": "test_uuid"}
    
    # Mock DB interaction
    mock_session = AsyncMock()
    mock_session_factory.return_value.__aenter__.return_value = mock_session
    
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
    result = await get_map_regions(token="fake_token")
    
    regions = result["regions"]
    # MBTI & Big Five should be AVAILABLE
    assert regions[0]["id"] == "mbti"
    assert regions[0]["status"] == "AVAILABLE"
    assert regions[1]["id"] == "bigfive"
    assert regions[1]["status"] == "AVAILABLE"
    
    # Enneagram should be LOCKED (Needs Lv.3 or MBTI)
    assert regions[2]["id"] == "enneagram"
    assert regions[2]["status"] == "LOCKED"

@pytest.mark.asyncio
@patch("app.api.map.decode_access_token")
@patch("app.api.map.AsyncSessionLocal")
async def test_get_map_regions_unlocked_by_quest(mock_session_factory, mock_decode):
    mock_decode.return_value = {"sub": "test_uuid"}
    mock_session = AsyncMock()
    mock_session_factory.return_value.__aenter__.return_value = mock_session
    
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
    result = await get_map_regions(token="fake_token")
    
    regions = result["regions"]
    # MBTI should be CONQUERED
    assert regions[0]["id"] == "mbti"
    assert regions[0]["status"] == "CONQUERED"
    
    # Enneagram should be AVAILABLE (because MBTI is done)
    assert regions[2]["id"] == "enneagram"
    assert regions[2]["status"] == "AVAILABLE"
