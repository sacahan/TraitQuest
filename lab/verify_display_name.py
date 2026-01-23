import sys
import os
import asyncio
import uuid
from unittest.mock import AsyncMock, MagicMock

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# --- MOCKING EVERYTHING BEFORE IMPORTING quest_ws ---
# We need to aggressively mock agents and google lib to avoid Pydantic schema errors
# because quest_ws imports them at module level.

mock_agents = MagicMock()
sys.modules['app.agents'] = mock_agents
sys.modules['app.agents.questionnaire'] = MagicMock()
sys.modules['app.agents.analytics'] = MagicMock()
sys.modules['app.agents.transformation'] = MagicMock()
sys.modules['app.agents.validator'] = MagicMock()
sys.modules['app.agents.summary'] = MagicMock()

sys.modules['google.genai'] = MagicMock()

# Mock redis_client
mock_redis = AsyncMock()
# We need to mock the module and the instance inside it
mock_redis_module = MagicMock()
mock_redis_module.redis_client = mock_redis
sys.modules['app.core.redis_client'] = mock_redis_module

# Mock database
mock_db_session = AsyncMock()
mock_db_session.__aenter__.return_value = mock_db_session
mock_db_session.__aexit__.return_value = None

mock_db_module = MagicMock()
mock_db_module.AsyncSessionLocal = MagicMock(return_value=mock_db_session)
sys.modules['app.db.session'] = mock_db_module

# Mock app.core.security
sys.modules['app.core.security'] = MagicMock()

# Mock app.core.session
sys.modules['app.core.session'] = MagicMock()

# Mock app.services
sys.modules['app.services.level_system'] = MagicMock()
sys.modules['app.services.game_assets'] = MagicMock()

# Mock app.models
sys.modules['app.models.quest'] = MagicMock()
sys.modules['app.db.models'] = MagicMock()
# We need User to be accessible for the select statement
mock_User = MagicMock()
mock_User.id = 'user_id_column'
mock_User.display_name = 'display_name_column'
sys.modules['app.db.models'].User = mock_User

# Mock sqlalchemy
mock_sqlalchemy = MagicMock()
sys.modules['sqlalchemy'] = mock_sqlalchemy

# Now import the target function
# Because we mocked specific modules in app.db.models, we need to be careful.
# Ideally, we let the import happen now that dependencies are mocked.
from app.api.quest_ws import get_user_display_name

async def test_redis_hit():
    print("Testing Redis Hit...")
    user_id = str(uuid.uuid4())
    expected_name = "Cached Hero"
    
    # Setup Redis mock to return a name
    mock_redis.get_display_name.return_value = expected_name
    
    # Run
    result = await get_user_display_name(user_id)
    
    # Verify
    assert result == expected_name
    mock_redis.get_display_name.assert_called_with(user_id)
    print("✅ Redis Hit Test Passed")

async def test_db_fallback():
    print("\nTesting DB Fallback (Redis Miss)...")
    user_id = str(uuid.uuid4())
    expected_name = "Database Hero"
    
    # Setup Redis mock to return None (miss)
    mock_redis.get_display_name.return_value = None
    
    # Setup DB mock
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = expected_name
    mock_db_session.execute.return_value = mock_result
    
    # Run
    result = await get_user_display_name(user_id)
    
    # Verify
    assert result == expected_name
    # Should have called DB
    assert mock_db_session.execute.called
    print("✅ DB Fallback Test Passed")
    
    # Verify Redis set was called
    mock_redis.set_display_name.assert_called_with(user_id, expected_name)
    print("✅ Redis Cache Set Test Passed")

async def main():
    try:
        await test_redis_hit()
        await test_db_fallback()
        print("\n🎉 All verifications passed!")
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
