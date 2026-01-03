"""
quest_ws.py - request_result 邏輯與正規化工具測試
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

# 延遲導入 app 物件
from app.api.quest_utils import normalize_transformation_output, validate_normalization_result  # Updated import

@pytest.mark.asyncio
async def test_normalize_transformation_output():
    """測試正規化函數：應將 ID 映射為完整物件並處理 Stats"""
    
    raw_output = {
        "race_id": "RACE_5",
        "class_id": "CLS_INTJ",
        "stance_id": "STN_C",
        "talent_ids": ["TAL_STRATEGIC", "TAL_ANALYTICAL"],
        "stats": {
            "STA_O": 85,
            "STA_C": 75,
            "STA_E": 40,
            "STA_A": 50,
            "STA_N": 70
        },
        "destiny_guide": {"daily": "預言...", "main": "任務...", "side": "支線...", "oracle": "神諭..."},
        "destiny_bonds": {"compatible": [], "conflicting": []}
    }
    
    # Mock 資料庫返回的資產定義
    mock_race = MagicMock()
    mock_race.id = "RACE_5"
    mock_race.name = "觀察者"
    mock_race.metadata_info = {"description": "Race Desc"}

    mock_class = MagicMock()
    mock_class.id = "CLS_INTJ"
    mock_class.name = "建築師"
    mock_class.metadata_info = {"description": "Class Desc"}

    mock_stance = MagicMock()
    mock_stance.id = "STN_C"
    mock_stance.name = "謹慎戰術家"
    mock_stance.metadata_info = {"description": "Stance Desc"}

    mock_talent1 = MagicMock()
    mock_talent1.id = "TAL_STRATEGIC"
    mock_talent1.name = "戰略思維"
    mock_talent1.metadata_info = {"description": "T1 Desc"}

    mock_talent2 = MagicMock()
    mock_talent2.id = "TAL_ANALYTICAL"
    mock_talent2.name = "分析洞察"
    mock_talent2.metadata_info = {"description": "T2 Desc"}
    
    mock_result = MagicMock()
    mock_result.scalars.return_value = [mock_race, mock_class, mock_stance, mock_talent1, mock_talent2]
    
    mock_db_session = AsyncMock()
    mock_db_session.execute.return_value = mock_result
    
    with patch("app.api.quest_utils.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value.__aenter__.return_value = mock_db_session
        
        normalized = await normalize_transformation_output(raw_output)
        
        # 驗證 ID 仍保留
        assert normalized["race_id"] == "RACE_5"
        assert normalized["class_id"] == "CLS_INTJ"
        
        # 驗證物件映射
        assert normalized["race"]["name"] == "觀察者"
        assert normalized["class"]["name"] == "建築師"
        assert normalized["stance"]["name"] == "謹慎戰術家"
        assert len(normalized["talents"]) == 2
        assert normalized["talents"][0]["name"] == "戰略思維"
        
        # 驗證 Stats 轉換 (ID -> 有意義的 Label)
        assert normalized["stats"]["openness"]["score"] == 85
        assert normalized["stats"]["openness"]["label"] == "智力(O)"
        assert normalized["stats"]["neuroticism"]["score"] == 70
        assert normalized["stats"]["neuroticism"]["label"] == "洞察(N)"
        
        # 驗證 Destiny 内容保留
        assert normalized["destiny_guide"]["daily"] == "預言..."

@pytest.mark.asyncio
async def test_normalize_output_missing_fields():
    """測試缺失欄位的邊界情況"""
    
    # 僅有部分 ID 的輸出
    raw_output = {
        "class_id": "CLS_INTJ",
        "stats": {}
    }
    
    mock_class = MagicMock()
    mock_class.id = "CLS_INTJ"
    mock_class.name = "建築師"
    mock_class.metadata_info = {}

    mock_result = MagicMock()
    mock_result.scalars.return_value = [mock_class]
    
    mock_db_session = AsyncMock()
    mock_db_session.execute.return_value = mock_result
    
    with patch("app.api.quest_utils.AsyncSessionLocal") as mock_session_local:
        mock_session_local.return_value.__aenter__.return_value = mock_db_session
        
        normalized = await normalize_transformation_output(raw_output)
        
        assert normalized["class_id"] == "CLS_INTJ"
        assert normalized["class"]["name"] == "建築師"
        assert "race" not in normalized
        assert normalized["stats"]["openness"]["score"] == 50 # 預設值

def test_validate_normalization_result():
    """測試資料驗證邏輯"""
    
    # 用例 1: 完美資料
    valid_data = {
        "race_id": "R1", "race": {"id": "R1", "name": "Race"},
        "class_id": "C1", "class": {"id": "C1", "name": "Class"},
        "stance_id": "S1", "stance": {"id": "S1", "name": "Stance"},
        "talent_ids": ["T1"], "talents": [{"id": "T1", "name": "Talent"}]
    }
    result = validate_normalization_result(valid_data)
    assert result["status"] == "SUCCESS"
    assert len(result["errors"]) == 0
    
    # 用例 2: 缺少 Race
    missing_race = {
        "race_id": "R_INVALID", 
        # missing "race" key
        "class_id": "C1", "class": {"id": "C1", "name": "Class"},
        "stance_id": "S1", "stance": {"id": "S1", "name": "Stance"}
    }
    result = validate_normalization_result(missing_race)
    assert result["status"] == "FAIL"
    assert "race" in result["errors"][0].lower()
    
    # 用例 3: 缺少天賦
    missing_talent = {
        "race_id": "R1", "race": {"id": "R1", "name": "Race"},
        "class_id": "C1", "class": {"id": "C1", "name": "Class"},
        "stance_id": "S1", "stance": {"id": "S1", "name": "Stance"},
        "talent_ids": ["T1", "T2"],
        "talents": [{"id": "T1", "name": "Talent"}] # Only T1 found
    }
    result = validate_normalization_result(missing_talent)
    assert result["status"] == "FAIL"
    assert "Talent" in result["errors"][-1]
