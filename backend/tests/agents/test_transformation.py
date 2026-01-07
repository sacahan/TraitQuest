"""
測試 Transformation Agent 的輸出驗證邏輯

本測試檔案驗證：
1. submit_transformation 工具正確處理各種參數組合
2. validate_transformation_output callback 正確檢核必要欄位
3. quest_type 的傳遞與讀取邏輯
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.agents.transformation import (
    submit_transformation,
    validate_transformation_output,
    TRANSFORMATION_INSTRUCTION
)
from google.adk.tools.tool_context import ToolContext


class TestSubmitTransformation:
    """測試 submit_transformation 工具"""
    
    def test_mbti_output(self):
        """測試 MBTI 類型的完整輸出"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {}
        
        result = submit_transformation(
            class_id="CLS_INTJ",
            hero_class={"id": "CLS_INTJ", "name": "戰略法師", "description": "獨立、戰略、高冷、冷靜"},
            destiny_guide={
                "daily": "今日宜深度思考",
                "main": "提升溝通技巧",
                "side": "分享規劃給朋友",
                "oracle": "孤獨的塔頂"
            },
            destiny_bonds={
                "compatible": [
                    {"class_id": "CLS_ENFP", "class_name": "元素召喚師", "sync_rate": 92, "advantage": "互補能量"}
                ],
                "conflicting": [
                    {"class_id": "CLS_ESFJ", "class_name": "輔助神官", "risk_level": "高", "friction_reason": "價值觀差異"}
                ]
            },
            tool_context=mock_context
        )
        
        # 驗證輸出包含所有必要欄位
        assert "class_id" in result
        assert "class" in result
        assert "destiny_guide" in result
        assert "destiny_bonds" in result
        
        # 驗證 ID 正確
        assert result["class_id"] == "CLS_INTJ"
        
        # 驗證完整物件格式
        assert result["class"]["id"] == "CLS_INTJ"
        assert result["class"]["name"] == "戰略法師"
        
        # 驗證 session state 已更新
        assert "transformation_output" in mock_context.state
    
    def test_enneagram_output(self):
        """測試 Enneagram 類型的完整輸出"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {}
        
        result = submit_transformation(
            race_id="RACE_5",
            race={"id": "RACE_5", "name": "智者族", "description": "渴求知識與觀察"},
            destiny_guide={
                "daily": "今日宜探索新知",
                "main": "平衡理性與感性",
                "side": "參加社交活動",
                "oracle": "知識即力量"
            },
            destiny_bonds={
                "compatible": [
                    {"class_id": "CLS_INTJ", "class_name": "戰略法師", "sync_rate": 90, "advantage": "深度思考"}
                ],
                "conflicting": [
                    {"class_id": "CLS_ESFP", "class_name": "幻術舞者", "risk_level": "極高", "friction_reason": "思維模式差異"}
                ]
            },
            tool_context=mock_context
        )
        
        assert "race_id" in result
        assert "race" in result
        assert result["race_id"] == "RACE_5"
    
    def test_bigfive_output(self):
        """測試 Big Five 類型的完整輸出"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {}
        
        result = submit_transformation(
            stats={
                "STA_O": 75,
                "STA_C": 60,
                "STA_E": 45,
                "STA_A": 80,
                "STA_N": 55
            },
            destiny_guide={
                "daily": "平衡五行",
                "main": "強化自律",
                "side": "探索新領域",
                "oracle": "和諧即力量"
            },
            destiny_bonds={
                "compatible": [
                    {"class_id": "CLS_INFP", "class_name": "吟遊詩人", "sync_rate": 85, "advantage": "創意思維"}
                ],
                "conflicting": [
                    {"class_id": "CLS_ESTJ", "class_name": "秩序騎士", "risk_level": "高", "friction_reason": "規則性矛盾"}
                ]
            },
            tool_context=mock_context
        )
        
        assert "stats" in result
        assert result["stats"]["STA_O"] == 75
    
    def test_only_non_none_values_saved(self):
        """測試只儲存非 None 的值"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {}
        
        result = submit_transformation(
            class_id="CLS_INTJ",
            hero_class={"id": "CLS_INTJ", "name": "戰略法師", "description": "測試"},
            destiny_guide={"daily": "test", "main": "test", "side": "test", "oracle": "test"},
            destiny_bonds={"compatible": [], "conflicting": []},
            # 故意不傳 race_id, race, stats 等
            tool_context=mock_context
        )
        
        # 確保未傳遞的欄位不在結果中
        assert "race_id" not in result
        assert "race" not in result
        assert "stats" not in result


class TestValidateTransformationOutput:
    """測試 validate_transformation_output callback"""
    
    @pytest.mark.asyncio
    async def test_mbti_validation_success(self):
        """測試 MBTI 驗證成功"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {"quest_type": "mbti"}
        
        tool_response = {
            "class_id": "CLS_INTJ",
            "class": {"id": "CLS_INTJ", "name": "戰略法師", "description": "測試"},
            "destiny_guide": {
                "daily": "test",
                "main": "test",
                "side": "test",
                "oracle": "test"
            },
            "destiny_bonds": {
                "compatible": [
                    {"class_id": "CLS_ENFP", "class_name": "元素召喚師", "sync_rate": 92, "advantage": "test"}
                ],
                "conflicting": [
                    {"class_id": "CLS_ESFJ", "class_name": "輔助神官", "risk_level": "高", "friction_reason": "test"}
                ]
            }
        }
        
        # Mock DB 查詢
        with patch('app.agents.transformation.AsyncSessionLocal') as mock_db:
            mock_session = AsyncMock()
            mock_db.return_value.__aenter__.return_value = mock_session
            
            # Mock DB 查詢結果 - class_id 存在
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = "CLS_INTJ"
            mock_session.execute.return_value = AsyncMock()
            mock_session.execute.return_value.fetchall.return_value = [("CLS_INTJ",)]
            
            result = await validate_transformation_output(
                tool_context=mock_context,
                tool_response=tool_response
            )
            
            # validate 應返回 None（表示使用原始結果）
            assert result is None
    
    @pytest.mark.asyncio
    async def test_missing_required_fields(self):
        """測試缺少必要欄位的情況"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {"quest_type": "mbti"}
        
        # 缺少 destiny_guide 和 destiny_bonds
        tool_response = {
            "class_id": "CLS_INTJ",
            "class": {"id": "CLS_INTJ", "name": "戰略法師", "description": "測試"}
        }
        
        with patch('app.agents.transformation.AsyncSessionLocal'):
            result = await validate_transformation_output(
                tool_context=mock_context,
                tool_response=tool_response
            )
            
            # 即使缺少欄位，也應返回 None（記錄警告但不中斷）
            assert result is None
    
    @pytest.mark.asyncio
    async def test_destiny_guide_format_validation(self):
        """測試 destiny_guide 格式驗證"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {"quest_type": "mbti"}
        
        # destiny_guide 缺少 oracle 欄位
        tool_response = {
            "class_id": "CLS_INTJ",
            "class": {"id": "CLS_INTJ", "name": "戰略法師", "description": "測試"},
            "destiny_guide": {
                "daily": "test",
                "main": "test",
                "side": "test"
                # 缺少 oracle
            },
            "destiny_bonds": {
                "compatible": [{"class_id": "CLS_ENFP", "class_name": "test", "sync_rate": 90, "advantage": "test"}],
                "conflicting": [{"class_id": "CLS_ESFJ", "class_name": "test", "risk_level": "高", "friction_reason": "test"}]
            }
        }
        
        with patch('app.agents.transformation.AsyncSessionLocal'):
            result = await validate_transformation_output(
                tool_context=mock_context,
                tool_response=tool_response
            )
            
            # 應記錄警告但返回 None
            assert result is None
    
    @pytest.mark.asyncio
    async def test_quest_type_none(self):
        """測試 quest_type 為 None 的情況"""
        mock_context = Mock(spec=ToolContext)
        mock_context.state = {"quest_type": None}
        
        tool_response = {"class_id": "CLS_INTJ"}
        
        with patch('app.agents.transformation.AsyncSessionLocal'):
            result = await validate_transformation_output(
                tool_context=mock_context,
                tool_response=tool_response
            )
            
            assert result is None


class TestTransformationInstruction:
    """測試 TRANSFORMATION_INSTRUCTION 的內容"""
    
    def test_instruction_contains_all_quest_types(self):
        """測試指令包含所有測驗類型"""
        assert "mbti" in TRANSFORMATION_INSTRUCTION
        assert "enneagram" in TRANSFORMATION_INSTRUCTION
        assert "bigfive" in TRANSFORMATION_INSTRUCTION
        assert "disc" in TRANSFORMATION_INSTRUCTION
        assert "gallup" in TRANSFORMATION_INSTRUCTION
    
    def test_instruction_contains_output_examples(self):
        """測試指令包含輸出範例"""
        assert "範例" in TRANSFORMATION_INSTRUCTION or "example" in TRANSFORMATION_INSTRUCTION.lower()
        assert "destiny_guide" in TRANSFORMATION_INSTRUCTION
        assert "destiny_bonds" in TRANSFORMATION_INSTRUCTION
    
    def test_instruction_contains_mapping_tables(self):
        """測試指令包含映射表"""
        assert "CLS_INTJ" in TRANSFORMATION_INSTRUCTION
        assert "RACE_1" in TRANSFORMATION_INSTRUCTION
        assert "STN_D" in TRANSFORMATION_INSTRUCTION
        assert "submit_transformation" in TRANSFORMATION_INSTRUCTION
