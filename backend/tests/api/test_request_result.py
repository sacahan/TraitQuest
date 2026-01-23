"""
transformation_agent - 轉生代理測試
"""
import pytest
import uuid
import json
from unittest.mock import AsyncMock, MagicMock, patch
import sys

@pytest.mark.asyncio
async def test_submit_transformation_logic():
    """測試 submit_transformation 邏輯"""
    from app.agents.copilot_transformation import submit_transformation, TransformationParams
    
    params = TransformationParams(
        class_id="CLS_INTJ",
        hero_class={"id": "CLS_INTJ", "name": "戰略法師", "description": "獨立、戰略"},
        destiny_guide={"daily": "預言...", "main": "任務...", "side": "支線...", "oracle": "神諭..."},
        destiny_bonds={"compatible": [], "conflicting": []}
    )
    
    result = await submit_transformation(params)
    
    # 驗證結果結構
    assert result["class_id"] == "CLS_INTJ"
    assert result["class"]["name"] == "戰略法師"
    assert "destiny_guide" in result
    assert "destiny_bonds" in result


@pytest.mark.asyncio
async def test_submit_transformation_race():
    """測試 Enneagram 測驗的種族輸出"""
    from app.agents.copilot_transformation import submit_transformation, TransformationParams
    
    params = TransformationParams(
        race_id="RACE_5",
        race={"id": "RACE_5", "name": "智者族", "description": "渴求知識與觀察的靈魂"},
        destiny_guide={"daily": "探索新知", "main": "深入學習", "side": "閱讀一本書", "oracle": "知識即力量"},
        destiny_bonds={"compatible": [], "conflicting": []}
    )
    
    result = await submit_transformation(params)
    
    assert result["race_id"] == "RACE_5"
    assert result["race"]["name"] == "智者族"
