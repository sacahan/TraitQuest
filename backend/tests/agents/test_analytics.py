import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.agents.analytics import analytics_agent, create_analytics_agent
from google.adk.runners import Runner
from google.genai import types

@pytest.mark.asyncio
async def test_analytics_agent_structure():
    # 測試 Agent 通道與工具定義
    agent = create_analytics_agent()
    assert agent.name == "analytics_agent"
    assert len(agent.tools) == 1
    assert agent.tools[0].__name__ == "submit_analysis"

# 由於涉及到 LLM 呼叫，整合測試通常在集成環境進行，
# 這裡我們可以 Mock Runner 來測試 Analytics Agent 的整合。
# 不過因為 Runner 是 ADK 內部的，我們主要驗證 Agent 本身的定義。
