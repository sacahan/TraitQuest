"""
Pytest 配置檔案

處理所有測試所需的通用 mock 設置。
"""

import sys
import os
from unittest.mock import MagicMock
import pytest

# 將專案根目錄添加到 PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Mock Copilot SDK 模組
mock_copilot = MagicMock()
mock_copilot.CopilotClient = MagicMock
mock_copilot.define_tool = MagicMock(side_effect=lambda **kwargs: lambda f: f)
mock_copilot.Tool = MagicMock

sys.modules["copilot"] = mock_copilot

# Mock google.genai
mock_genai = MagicMock()
sys.modules["google.genai"] = mock_genai
sys.modules["google.genai.types"] = mock_genai.types


@pytest.fixture
def mock_session_service():
    """提供 mock session service 給測試"""
    from tests.mocks.session_mock import MockInMemorySessionService
    
    service = MockInMemorySessionService()
    yield service
    service.clear_sessions()
