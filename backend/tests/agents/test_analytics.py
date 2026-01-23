import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.agents.copilot_analytics import (
    get_analytics_session_id,
    create_analytics_tools,
    submit_analysis,
    SubmitAnalysisParams,
)

@pytest.mark.asyncio
async def test_analytics_agent_structure():
    # 測試 工具定義
    tools = create_analytics_tools()
    assert len(tools) == 1
    # 工具名稱根據 Mock 實現可能不同，這裡檢查核心功能
    assert any("submit_analysis" in str(t) for t in tools)

@pytest.mark.asyncio
async def test_submit_analysis_logic():
    # 測試分析邏輯
    params = SubmitAnalysisParams(
        quality_score=1.5,
        trait_deltas={"Openness": 0.5, "Extraversion": -0.2},
        analysis_reason="測試原因"
    )
    result = await submit_analysis(params)
    
    assert result["quality_score"] == 1.5
    assert result["trait_deltas"]["Openness"] == 0.5
    assert result["analysis_reason"] == "測試原因"

@pytest.mark.asyncio
async def test_submit_analysis_bounds():
    # 測試評分邊界
    params_low = SubmitAnalysisParams(
        quality_score=0.5,
        trait_deltas={},
        analysis_reason="過低"
    )
    result_low = await submit_analysis(params_low)
    assert result_low["quality_score"] == 1.0
    
    params_high = SubmitAnalysisParams(
        quality_score=2.5,
        trait_deltas={},
        analysis_reason="過高"
    )
    result_high = await submit_analysis(params_high)
    assert result_high["quality_score"] == 2.0
