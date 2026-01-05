"""
transformation_agent - 轉生代理測試
"""
import pytest
import uuid
import json
from unittest.mock import AsyncMock, MagicMock, patch
import sys

# Mock google.adk 相關模組
mock_adk = MagicMock()
sys.modules['google.adk'] = mock_adk
sys.modules['google.adk.agents'] = mock_adk.agents
sys.modules['google.adk.runners'] = mock_adk.runners
sys.modules['google.adk.models'] = mock_adk.models
sys.modules['google.adk.models.lite_llm'] = mock_adk.models.lite_llm
sys.modules['google.adk.tools'] = mock_adk.tools
sys.modules['google.adk.tools.tool_context'] = mock_adk.tools.tool_context
sys.modules['google.adk.sessions'] = mock_adk.sessions
sys.modules['google.adk.sessions.in_memory_session_service'] = mock_adk.sessions.in_memory_session_service

# Mock google.genai
mock_genai = MagicMock()
sys.modules['google.genai'] = mock_genai
sys.modules['google.genai.types'] = mock_genai.types

# 設定 mock 類別
mock_adk.agents.Agent = MagicMock
mock_adk.runners.Runner = MagicMock
mock_adk.models.lite_llm.LiteLlm = MagicMock
mock_adk.tools.tool_context.ToolContext = MagicMock


@pytest.mark.asyncio
async def test_validate_transformation_output_db_verification():
    """測試 after_tool_callback 的 DB 驗證功能"""
    from app.agents.transformation import validate_transformation_output
    
    # Mock tool_context
    mock_context = MagicMock()
    mock_context.state = {"quest_type": "mbti"}
    
    # 測試資料
    tool_response = {
        "class_id": "CLS_INTJ",
        "class": {"id": "CLS_INTJ", "name": "戰略法師", "description": "獨立、戰略"},
        "destiny_guide": {"daily": "預言...", "main": "任務..."},
        "destiny_bonds": {"compatible": [], "conflicting": []}
    }
    
    # Mock DB 查詢結果
    mock_db_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.__iter__ = lambda self: iter([("CLS_INTJ",)])
    mock_db_session.execute.return_value = mock_result
    
    with patch("app.agents.transformation.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value.__aenter__.return_value = mock_db_session
        
        # 執行驗證
        result = await validate_transformation_output(mock_context, tool_response)
        
        # 驗證結果應為 None（使用原始結果）
        assert result is None


@pytest.mark.asyncio
async def test_validate_transformation_output_missing_fields():
    """測試缺少必要欄位時的警告行為"""
    from app.agents.transformation import validate_transformation_output
    
    mock_context = MagicMock()
    mock_context.state = {"quest_type": "mbti"}
    
    # 缺少 destiny_bonds
    tool_response = {
        "class_id": "CLS_INTJ",
        "class": {"id": "CLS_INTJ", "name": "戰略法師"},
        "destiny_guide": {"daily": "預言..."}
        # 缺少 destiny_bonds
    }
    
    mock_db_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.__iter__ = lambda self: iter([("CLS_INTJ",)])
    mock_db_session.execute.return_value = mock_result
    
    with patch("app.agents.transformation.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value.__aenter__.return_value = mock_db_session
        
        # 執行驗證 - 應記錄警告但不中斷
        result = await validate_transformation_output(mock_context, tool_response)
        
        # 即使有缺失欄位，也應返回 None（繼續流程）
        assert result is None


def test_submit_transformation_with_full_objects():
    """測試 submit_transformation 可接受完整物件參數"""
    from app.agents.transformation import submit_transformation
    
    mock_context = MagicMock()
    mock_context.state = {}
    
    result = submit_transformation(
        class_id="CLS_INTJ",
        hero_class={"id": "CLS_INTJ", "name": "戰略法師", "description": "獨立、戰略"},
        destiny_guide={"daily": "預言...", "main": "任務...", "side": "支線...", "oracle": "神諭..."},
        destiny_bonds={"compatible": [], "conflicting": []},
        tool_context=mock_context
    )
    
    # 驗證結果結構
    assert result["class_id"] == "CLS_INTJ"
    assert result["class"]["name"] == "戰略法師"
    assert "destiny_guide" in result
    assert "destiny_bonds" in result
    
    # 驗證 state 已更新
    assert mock_context.state["transformation_output"] == result


def test_submit_transformation_race():
    """測試 Enneagram 測驗的種族輸出"""
    from app.agents.transformation import submit_transformation
    
    mock_context = MagicMock()
    mock_context.state = {}
    
    result = submit_transformation(
        race_id="RACE_5",
        race={"id": "RACE_5", "name": "智者族", "description": "渴求知識與觀察的靈魂"},
        destiny_guide={"daily": "探索新知", "main": "深入學習", "side": "閱讀一本書", "oracle": "知識即力量"},
        tool_context=mock_context
    )
    
    assert result["race_id"] == "RACE_5"
    assert result["race"]["name"] == "智者族"
