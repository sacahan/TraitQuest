"""
英雄屬性轉換測試 (Red Stage)
"""

import pytest
from unittest.mock import AsyncMock, patch
from app.core.calculators import PsychologicalCalculator


@pytest.fixture
def calculator():
    return PsychologicalCalculator()


def test_enneagram_to_race_mapping(calculator):
    """測試九型人格到種族的映射"""
    # Enneagram Type 1 -> RACE_1
    # Type 5 -> RACE_5
    assert calculator.map_enneagram_to_race("Type 1") == "RACE_1"
    assert calculator.map_enneagram_to_race("Type 5") == "RACE_5"
    assert calculator.map_enneagram_to_race("Type 9") == "RACE_9"


def test_mbti_to_class_mapping(calculator):
    """測試 MBTI 到職業的映射"""
    # INTJ -> CLS_INTJ
    # ENFP -> CLS_ENFP
    assert calculator.map_mbti_to_class("INTJ") == "CLS_INTJ"
    assert calculator.map_mbti_to_class("ENFP") == "CLS_ENFP"


def test_disc_to_stance_mapping(calculator):
    """測試 DISC 到對戰風格的映射"""
    # D -> STN_D
    # I -> STN_I
    assert calculator.map_disc_to_stance("D") == "STN_D"
    assert calculator.map_disc_to_stance("S") == "STN_S"


def test_gallup_to_talent_mapping(calculator):
    """測試 Gallup 到天賦技能的映射"""
    # ACH (Achievement) -> TAL_ACH
    traits = ["ACH", "STR", "EMP"]
    talents = calculator.map_gallup_to_talents(traits)
    assert "TAL_ACH" in talents
    assert "TAL_STR" in talents
    assert "TAL_EMP" in talents


@pytest.mark.asyncio
async def test_validate_ids_against_game_assets(calculator):
    """測試產出的 ID 是否存在於合法清單中"""
    mock_assets = {
        "race": ["RACE_1", "RACE_5", "RACE_9"],
        "class": ["CLS_INTJ", "CLS_ENFP"],
        "stance": ["STN_D", "STN_S"],
        "talent": ["TAL_ACH", "TAL_STR", "TAL_EMP"],
    }

    with patch(
        "app.services.game_assets.game_assets_service.get_all_valid_ids",
        new_callable=AsyncMock,
    ) as mock_get:
        mock_get.return_value = mock_assets

        # 測試合法 ID
        assert await calculator.is_valid_asset_id("RACE_1", "race") is True
        assert await calculator.is_valid_asset_id("CLS_INTJ", "class") is True

        # 測試非法 ID
        assert await calculator.is_valid_asset_id("RACE_99", "race") is False
        assert await calculator.is_valid_asset_id("CLS_INVALID", "class") is False
