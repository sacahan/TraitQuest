from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.models import User
from app.core.security import verify_google_token, create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    token: str

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Verify Google Token
    google_info = await verify_google_token(request.token)
    if not google_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = google_info["sub"]
    email = google_info.get("email")
    name = google_info.get("name")
    picture = google_info.get("picture")

    # Check if user exists
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    is_new_user = False
    if not user:
        is_new_user = True
        user = User(
            google_id=google_id,
            display_name=name,
            avatar_url=picture
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "userId": str(user.id),
        "displayName": user.display_name,
        "avatarUrl": user.avatar_url,
        "level": user.level,
        "exp": user.exp,
        "isNewUser": is_new_user,
        "accessToken": access_token
    }
