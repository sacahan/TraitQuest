"""
Copilot SDK Mock（用於測試環境）
"""
import json
import asyncio
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass
from enum import Enum


class EventType(Enum):
    ASSISTANT_MESSAGE = "assistant.message"
    TOOL_EXECUTION_START = "tool.execution_start"
    TOOL_EXECUTION_END = "tool.execution_end"
    SESSION_IDLE = "session.idle"


@dataclass
class MockData:
    content: str


class MockEvent:
    def __init__(self, event_type: EventType, data: Any = None):
        self.type = event_type
        self.data = data


class MockSession:
    """Mock Copilot Session"""
    
    def __init__(self, session_id: str, config: Dict):
        self.session_id = session_id
        self.config = config
        self._handlers = []
        self._history = []
    
    def on(self, handler: Callable):
        """註冊事件處理器"""
        self._handlers.append(handler)
    
    async def send(self, message: Dict):
        """模擬發送訊息"""
        self._history.append(message)
        
        # 模擬回應
        instruction = message.get("prompt", "")
        
        # 根據 instruction 產生回應
        response = self._generate_response(instruction)
        
        # 模擬異步回應
        await asyncio.sleep(0.1)
        
        # 發送事件
        for handler in self._handlers:
            handler(MockEvent(EventType.ASSISTANT_MESSAGE, MockData(response)))
            handler(MockEvent(EventType.SESSION_IDLE))
    
    def _generate_response(self, instruction: str) -> str:
        """產生 Mock 回應"""
        # 預設回應格式
        if "試煉" in instruction.lower() or "questionnaire" in instruction.lower():
            return json.dumps({
                "narrative": "測試情境描述",
                "question": {
                    "text": "測驗題目？",
                    "options": [{"id": "1", "text": "選項A"}, {"id": "2", "text": "選項B"}],
                    "type": "QUANTITATIVE"
                }
            })
        elif "分析" in instruction.lower() or "analytics" in instruction.lower():
            return json.dumps({
                "quality_score": 1.5,
                "trait_deltas": {"Openness": 0.3},
                "analysis_reason": "回答符合題目要求"
            })
        elif "轉生" in instruction.lower() or "transformation" in instruction.lower():
            return json.dumps({
                "class_id": "CLS_INTJ",
                "hero_class": {"id": "CLS_INTJ", "name": "戰略法師", "description": "描述"}
            })
        elif "史官" in instruction.lower() or "summary" in instruction.lower():
            return json.dumps({"hero_chronicle": "冒險者的史詩摘要"})
        
        return '{"result": "success"}'
    
    async def destroy(self):
        """銷毀會話"""
        pass


class MockCopilotClient:
    """Mock Copilot Client"""
    
    _sessions: Dict[str, MockSession] = {}
    
    async def start(self):
        """啟動客戶端"""
        pass
    
    async def stop(self):
        """停止客戶端"""
        pass
    
    async def create_session(self, config: Dict) -> MockSession:
        """創建會話"""
        session_id = f"session_{len(self._sessions)}"
        session = MockSession(session_id, config)
        self._sessions[session_id] = session
        return session
    
    def clear_sessions(self):
        """清除所有會話"""
        self._sessions.clear()


# 全域 Mock 實例
mock_copilot = MockCopilotClient()
