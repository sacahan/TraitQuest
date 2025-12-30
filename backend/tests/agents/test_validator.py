"""
Validator Agent 單元測試

由於 google.adk 模組需要特定虛擬環境，此測試使用 mock 來避免直接導入。
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import sys

# Mock google.adk 模組以避免導入錯誤
mock_adk = MagicMock()
sys.modules['google.adk'] = mock_adk
sys.modules['google.adk.agents'] = mock_adk.agents
sys.modules['google.adk.models'] = mock_adk.models
sys.modules['google.adk.models.lite_llm'] = mock_adk.models.lite_llm
sys.modules['google.adk.tools'] = mock_adk.tools
sys.modules['google.adk.tools.tool_context'] = mock_adk.tools.tool_context

# 設定 mock 類別
mock_adk.agents.Agent = MagicMock
mock_adk.models.lite_llm.LiteLlm = MagicMock
mock_adk.tools.tool_context.ToolContext = MagicMock


class TestVerifyIds:
    """測試 verify_ids 工具函數"""
    
    @pytest.mark.asyncio
    async def test_verify_ids_with_empty_list(self):
        """空列表應返回空結果"""
        # 延遲導入以確保 mock 生效
        from app.agents.validator import verify_ids
        
        result = await verify_ids(category="race", id_values=[])
        assert result == {"valid_ids": [], "invalid_ids": []}
    
    @pytest.mark.asyncio
    async def test_verify_ids_with_valid_ids(self):
        """測試有效 ID 的驗證"""
        from app.agents.validator import verify_ids
        
        # Mock 資料庫 session
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.fetchall.return_value = [("RACE_1",), ("RACE_2",)]
        mock_session.execute = AsyncMock(return_value=mock_result)
        
        with patch('app.agents.validator.AsyncSessionLocal') as mock_session_local:
            mock_session_local.return_value.__aenter__.return_value = mock_session
            mock_session_local.return_value.__aexit__.return_value = None
            
            result = await verify_ids(
                category="race",
                id_values=["RACE_1", "RACE_2", "RACE_99"]
            )
            
            assert result["valid_ids"] == ["RACE_1", "RACE_2"]
            assert result["invalid_ids"] == ["RACE_99"]
    
    @pytest.mark.asyncio
    async def test_verify_ids_with_all_invalid(self):
        """測試全部無效 ID 的情況"""
        from app.agents.validator import verify_ids
        
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.fetchall.return_value = []
        mock_session.execute = AsyncMock(return_value=mock_result)
        
        with patch('app.agents.validator.AsyncSessionLocal') as mock_session_local:
            mock_session_local.return_value.__aenter__.return_value = mock_session
            mock_session_local.return_value.__aexit__.return_value = None
            
            result = await verify_ids(
                category="class",
                id_values=["INVALID_1", "INVALID_2"]
            )
            
            assert result["valid_ids"] == []
            assert result["invalid_ids"] == ["INVALID_1", "INVALID_2"]


class TestSubmitValidation:
    """測試 submit_validation 工具函數"""
    
    def test_submit_validation_success(self):
        """測試成功驗證"""
        from app.agents.validator import submit_validation
        
        mock_context = MagicMock()
        mock_context.state = {}
        
        result = submit_validation(
            status="SUCCESS",
            errors=None,
            tool_context=mock_context
        )
        
        assert result["status"] == "SUCCESS"
        assert result["errors"] == []
        assert mock_context.state["validation_output"] == result
    
    def test_submit_validation_fail(self):
        """測試失敗驗證"""
        from app.agents.validator import submit_validation
        
        mock_context = MagicMock()
        mock_context.state = {}
        
        result = submit_validation(
            status="FAIL",
            errors=["Invalid ID: RACE_99", "Logical error: mismatch"],
            tool_context=mock_context
        )
        
        assert result["status"] == "FAIL"
        assert len(result["errors"]) == 2
        assert "Invalid ID: RACE_99" in result["errors"]
        assert mock_context.state["validation_output"] == result


class TestValidatorAgentStructure:
    """測試 Validator Agent 結構定義"""
    
    def test_agent_has_verify_ids_in_instruction(self):
        """測試指令中包含 verify_ids 說明"""
        from app.agents.validator import VALIDATOR_INSTRUCTION
        assert "verify_ids" in VALIDATOR_INSTRUCTION
    
    def test_instruction_mentions_database_query(self):
        """測試指令表明使用資料庫查詢"""
        from app.agents.validator import VALIDATOR_INSTRUCTION
        assert "資料庫" in VALIDATOR_INSTRUCTION
