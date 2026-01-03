import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.db.models import User
from sqlalchemy import select

async def create_test_user():
    async with AsyncSessionLocal() as session:
        # Check if user exists
        stmt = select(User).where(User.google_id == "test_user")
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User test_user already exists with ID: {user.id}")
            return
            
        # Create new user
        new_user = User(
            google_id="test_user",
            display_name="Test User",
            email="test@example.com",
            level=1,
            exp=0,
            picture="https://lh3.googleusercontent.com/a/default-user"
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        print(f"Created test_user with ID: {new_user.id}")

if __name__ == "__main__":
    asyncio.run(create_test_user())
