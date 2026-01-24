"""
心理測評計分聚合器測試 (Full Coverage)
"""
import pytest
from unittest.mock import AsyncMock, patch
from app.core.calculators import PsychologicalCalculator

@pytest.fixture
def calculator():
    return PsychologicalCalculator()

def test_aggregate_traits_empty(calculator):
    """測試空資料聚合"""
    assert calculator.aggregate_traits([], "mbti") == {}

def test_map_enneagram_invalid_format(calculator):
    """測試九型人格非法格式"""
    assert calculator.map_enneagram_to_race("Invalid") == "RACE_UNKNOWN"
    assert calculator.map_enneagram_to_race(None) == "RACE_UNKNOWN"

def test_map_disc_empty(calculator):
    """測試 DISC 空值"""
    assert calculator.map_disc_to_stance("") == "STN_U"

@pytest.mark.asyncio
async def test_is_valid_asset_id_error(calculator):
    """測試 ID 驗證出錯情境"""
    with patch("app.services.game_assets.game_assets_service.get_all_valid_ids", side_effect=Exception("DB Error")):
        assert await calculator.is_valid_asset_id("ID", "race") is False

def test_calculate_final_mbti_type_full(calculator):
    """測試 MBTI 所有維度判定"""
    # 案例 1: INTJ
    assert calculator.get_mbti_type({"E": 0, "I": 1, "S": 0, "N": 1, "T": 1, "F": 0, "J": 1, "P": 0}) == "INTJ"
    # 案例 2: ENFP
    assert calculator.get_mbti_type({"E": 1, "I": 0, "S": 0, "N": 1, "T": 0, "F": 1, "J": 0, "P": 1}) == "ENFP"
