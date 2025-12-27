from google.adk.sessions.in_memory_session_service import InMemorySessionService

# 單例模式：提供全域共享的 Session Service
# 未來可替換為 Redis-backed Session Service
session_service = InMemorySessionService()
