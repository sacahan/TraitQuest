"""
Pytest 配置檔案

處理所有測試所需的通用 mock 設置，避免模組導入時的初始化問題。
"""

import sys
from unittest.mock import MagicMock

# Mock google.adk 模組 - 必須在任何導入 app 模組之前設置
mock_adk = MagicMock()
mock_adk.agents = MagicMock()
mock_adk.runners = MagicMock()
mock_adk.models = MagicMock()
mock_adk.models.lite_llm = MagicMock()
mock_adk.tools = MagicMock()
mock_adk.tools.tool_context = MagicMock()
mock_adk.sessions = MagicMock()
mock_adk.sessions.in_memory_session_service = MagicMock()
mock_adk.sessions.session = MagicMock()

# 設置 sys.modules - 必須在任何導入之前完成
sys.modules["google.adk"] = mock_adk
sys.modules["google.adk.agents"] = mock_adk.agents
sys.modules["google.adk.runners"] = mock_adk.runners
sys.modules["google.adk.models"] = mock_adk.models
sys.modules["google.adk.models.lite_llm"] = mock_adk.models.lite_llm
sys.modules["google.adk.tools"] = mock_adk.tools
sys.modules["google.adk.tools.tool_context"] = mock_adk.tools.tool_context
sys.modules["google.adk.sessions"] = mock_adk.sessions
sys.modules["google.adk.sessions.in_memory_session_service"] = (
    mock_adk.sessions.in_memory_session_service
)
sys.modules["google.adk.sessions.session"] = mock_adk.sessions.session

# Mock google.genai
mock_genai = MagicMock()
sys.modules["google.genai"] = mock_genai
sys.modules["google.genai.types"] = mock_genai.types

# 設置 mock 類別 - 參考 test_request_result.py 的做法
mock_adk.agents.Agent = MagicMock
mock_adk.runners.Runner = MagicMock
mock_adk.models.lite_llm.LiteLlm = MagicMock
mock_adk.tools.tool_context.ToolContext = MagicMock
