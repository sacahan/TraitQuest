import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.agents.copilot_transformation import (
    submit_transformation,
    TransformationParams,
    get_transformation_session_id,
)

class TestSubmitTransformation:
    """測試 submit_transformation 工具"""

    @pytest.mark.asyncio
    async def test_mbti_output(self):
        """測試 MBTI 類型的完整輸出"""
        params = TransformationParams(
            class_id="CLS_INTJ",
            hero_class={
                "id": "CLS_INTJ",
                "name": "戰略法師",
                "description": "獨立、戰略、高冷、冷靜",
            },
            destiny_guide={
                "daily": "今日宜深度思考",
                "main": "提升溝通技巧",
                "side": "分享規劃給朋友",
                "oracle": "孤獨的塔頂",
            },
            destiny_bonds={
                "compatible": [
                    {
                        "class_id": "CLS_ENFP",
                        "class_name": "元素召喚師",
                        "sync_rate": 92,
                        "advantage": "互補能量",
                    }
                ],
                "conflicting": [
                    {
                        "class_id": "CLS_ESFJ",
                        "class_name": "輔助神官",
                        "risk_level": "高",
                        "friction_reason": "價值觀差異",
                    }
                ],
            }
        )
        
        result = await submit_transformation(params)

        # 驗證輸出包含所有必要欄位
        assert "class_id" in result
        assert "class" in result
        assert "destiny_guide" in result
        assert "destiny_bonds" in result

        # 驗證 ID 正確
        assert result["class_id"] == "CLS_INTJ"

    @pytest.mark.asyncio
    async def test_enneagram_output(self):
        """測試 Enneagram 類型的完整輸出"""
        params = TransformationParams(
            race_id="RACE_5",
            race={"id": "RACE_5", "name": "智者族", "description": "渴求知識與觀察"},
            destiny_guide={
                "daily": "今日宜探索新知",
                "main": "平衡理性與感性",
                "side": "參加社交活動",
                "oracle": "知識即力量",
            },
            destiny_bonds={"compatible": [], "conflicting": []}
        )
        
        result = await submit_transformation(params)

        assert "race_id" in result
        assert "race" in result
        assert result["race_id"] == "RACE_5"

    @pytest.mark.asyncio
    async def test_bigfive_output(self):
        """測試 Big Five 類型的完整輸出"""
        params = TransformationParams(
            stats={"STA_O": 75, "STA_C": 60, "STA_E": 45, "STA_A": 80, "STA_N": 55},
            destiny_guide={
                "daily": "平衡五行",
                "main": "強化自律",
                "side": "探索新領域",
                "oracle": "和諧即力量",
            },
            destiny_bonds={"compatible": [], "conflicting": []}
        )
        
        result = await submit_transformation(params)

        assert "stats" in result
        assert result["stats"]["STA_O"] == 75
