import pytest
from app.core.session import InMemorySessionService

@pytest.mark.asyncio
async def test_session_isolation():
    """驗證不同用戶和應用的 Session 隔離性"""
    service = InMemorySessionService()
    
    # 用戶 A 在應用 1 的 session
    session_a1 = await service.get_session("app1", "userA", "sess1")
    session_a1.state["key"] = "valueA1"
    
    # 用戶 B 在應用 1 的 session
    session_b1 = await service.get_session("app1", "userB", "sess1")
    session_b1.state["key"] = "valueB1"
    
    # 用戶 A 在應用 2 的 session
    session_a2 = await service.get_session("app2", "userA", "sess1")
    session_a2.state["key"] = "valueA2"
    
    # 驗證狀態各自獨立
    assert (await service.get_session("app1", "userA", "sess1")).state["key"] == "valueA1"
    assert (await service.get_session("app1", "userB", "sess1")).state["key"] == "valueB1"
    assert (await service.get_session("app2", "userA", "sess1")).state["key"] == "valueA2"

@pytest.mark.asyncio
async def test_session_persistence_in_memory():
    """驗證 Session 狀態在內存中的持久性"""
    service = InMemorySessionService()
    
    session = await service.get_session("quest", "user123", "default")
    session.state["progress"] = 50
    await service.update_session(session)
    
    # 再次獲取應保留狀態
    retrieved_session = await service.get_session("quest", "user123", "default")
    assert retrieved_session.state["progress"] == 50
