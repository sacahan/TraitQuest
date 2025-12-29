import asyncio
from google.adk.sessions.in_memory_session_service import InMemorySessionService

async def test():
    svc = InMemorySessionService()
    await svc.create_session(app_name='a', user_id='u', session_id='s')
    s1 = await svc.get_session(app_name='a', user_id='u', session_id='s')
    s1.state['foo'] = 'bar'
    
    # Try using create_session to overwrite
    await svc.create_session(app_name='a', user_id='u', session_id='s', state=s1.state)
    
    s2 = await svc.get_session(app_name='a', user_id='u', session_id='s')
    print(f"After re-creation: {s2.state}")
    print(f"Overwrite works: {s2.state.get('foo') == 'bar'}")

if __name__ == '__main__':
    asyncio.run(test())
