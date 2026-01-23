"""
自訂 Session 管理（替代 google.adk）

提供內存型會話管理，支持多用戶、多應用、多會話的三層結構。
"""
from dataclasses import dataclass, field
from typing import Dict, Optional, Any
import logging

logger = logging.getLogger("app")


@dataclass
class Session:
    """
    會話模型
    
    表示一個用戶在特定應用下的會話狀態。
    """
    app_name: str
    user_id: str
    session_id: str
    state: Dict[str, Any] = field(default_factory=dict)


class InMemorySessionService:
    """
    內存會話服務
    
    管理多應用、多用戶的會話狀態。
    結構：{app_name: {user_id: {session_id: session}}}
    """
    
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Dict[str, Session]]] = {}
    
    async def create_session(
        self,
        app_name: str,
        user_id: str,
        session_id: str,
        state: Optional[Dict[str, Any]] = None,
    ) -> Session:
        """
        創建新會話
        
        Args:
            app_name: 應用名稱
            user_id: 用戶 ID
            session_id: 會話 ID
            state: 初始狀態（可選）
        
        Returns:
            Session 物件
        """
        # 確保嵌套結構存在
        if app_name not in self._sessions:
            self._sessions[app_name] = {}
        if user_id not in self._sessions[app_name]:
            self._sessions[app_name][user_id] = {}
        
        session = Session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state=state or {},
        )
        
        self._sessions[app_name][user_id][session_id] = session
        logger.debug(
            f"✅ Session created: {app_name}#{user_id}#{session_id}"
        )
        
        return session
    
    async def get_session(
        self,
        app_name: str,
        user_id: str,
        session_id: str,
    ) -> Session:
        """
        獲取會話
        
        若會話不存在，自動創建（寬鬆模式）。
        返回原始實例，允許直接修改 state。
        
        Args:
            app_name: 應用名稱
            user_id: 用戶 ID
            session_id: 會話 ID
        
        Returns:
            Session 物件
        """
        # 檢查會話是否存在
        if (
            app_name in self._sessions
            and user_id in self._sessions[app_name]
            and session_id in self._sessions[app_name][user_id]
        ):
            return self._sessions[app_name][user_id][session_id]
        
        # 不存在則自動創建
        logger.debug(
            f"ℹ️ Session not found, auto-creating: {app_name}#{user_id}#{session_id}"
        )
        return await self.create_session(app_name, user_id, session_id)
    
    async def update_session(self, session: Session) -> None:
        """
        更新會話
        
        由於 get_session() 返回原始實例而非副本，
        state 的修改會直接反映到存儲的對象。
        此方法為空操作（但保留接口以兼容現有代碼）。
        
        Args:
            session: Session 物件
        """
        # 無需操作 - 所有修改都會直接反映到存儲的實例
        pass


# 全域單例
session_service = InMemorySessionService()
