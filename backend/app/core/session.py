from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk.sessions.session import Session

class CustomInMemorySessionService(InMemorySessionService):
    async def update_session(self, session: Session):
        """
        Manually update session state in the in-memory store.
        Required because get_session returns a copy/new instance in the default implementation.
        """
        # Ensure the session has necessary keys
        if not session.app_name or not session.user_id or not session.id:
             return
             
        # Initialize nested structure if missing
        if session.app_name not in self.sessions:
             self.sessions[session.app_name] = {}
        if session.user_id not in self.sessions[session.app_name]:
             self.sessions[session.app_name][session.user_id] = {}
             
        # Overwrite with the modified session object
        self.sessions[session.app_name][session.user_id][session.id] = session

# 單例模式：提供全域共享的 Session Service
# 未來可替換為 Redis-backed Session Service
session_service = CustomInMemorySessionService()
