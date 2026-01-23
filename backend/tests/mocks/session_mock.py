"""
Session Mock（用於測試環境）

提供與實際 session.py 相同介面的 mock 實作，
用於單元測試和集成測試中隔離 session 邏輯。
"""
from dataclasses import dataclass, field
from typing import Dict, Optional, Any


@dataclass
class MockSession:
    """Mock 會話模型"""
    app_name: str
    user_id: str
    session_id: str
    state: Dict[str, Any] = field(default_factory=dict)


class MockInMemorySessionService:
    """
    Mock 內存會話服務
    
    完全鏡像實際的 InMemorySessionService，用於測試。
    """
    
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Dict[str, MockSession]]] = {}
    
    async def create_session(
        self,
        app_name: str,
        user_id: str,
        session_id: str,
        state: Optional[Dict[str, Any]] = None,
    ) -> MockSession:
        """創建新會話"""
        if app_name not in self._sessions:
            self._sessions[app_name] = {}
        if user_id not in self._sessions[app_name]:
            self._sessions[app_name][user_id] = {}
        
        session = MockSession(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state=state or {},
        )
        
        self._sessions[app_name][user_id][session_id] = session
        return session
    
    async def get_session(
        self,
        app_name: str,
        user_id: str,
        session_id: str,
    ) -> MockSession:
        """獲取會話（不存在則自動創建）"""
        if (
            app_name in self._sessions
            and user_id in self._sessions[app_name]
            and session_id in self._sessions[app_name][user_id]
        ):
            return self._sessions[app_name][user_id][session_id]
        
        return await self.create_session(app_name, user_id, session_id)
    
    async def update_session(self, session: MockSession) -> None:
        """更新會話（無操作）"""
        pass
    
    def clear_sessions(self) -> None:
        """清除所有會話（測試清理用）"""
        self._sessions.clear()


# 全域 Mock 實例
mock_session_service = MockInMemorySessionService()
