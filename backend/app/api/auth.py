from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import User, UserQuest, GameDefinition
from app.core.security import (
    verify_google_token,
    create_access_token,
    decode_access_token,
)
from app.services.email_service import send_welcome_email
from app.services.cache_service import CacheService
from pydantic import BaseModel


import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    token: str


@router.post("/login")
async def login(
    request: LoginRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    # Verify Google Token
    google_info = await verify_google_token(request.token)
    if not google_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = google_info["sub"]
    name = google_info.get("name")
    picture = google_info.get("picture")
    email = google_info.get("email")

    # Check if user exists
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    is_new_user = False
    if not user:
        is_new_user = True
        user = User(
            google_id=google_id,
            email=email,
            display_name=name,
            hero_avatar_url="/assets/images/classes/civilian.webp",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Send Welcome Email
        if email:
            background_tasks.add_task(send_welcome_email, email, name)
    else:
        # 現有用戶：若 email 為空則更新
        if email and not user.email:
            user.email = email
            await db.commit()
            await db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "userId": str(user.id),
        "displayName": user.display_name,
        "avatarUrl": user.hero_avatar_url or "/assets/images/classes/civilian.webp",
        "level": user.level,
        "exp": user.exp,
        "isNewUser": is_new_user,
        "accessToken": access_token,
    }


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.get("/me")
async def get_me(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id_str = payload.get("sub")
    user_id = uuid.UUID(user_id_str)

    cached = await CacheService.get_user_profile(str(user_id))
    if cached:
        return cached

    # 獲取基礎用戶資料
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 從 User.hero_profile 讀取完整英雄檔案
    hero_profile = user.hero_profile or {}

    # 獲取已完成任務數量以計算同步率
    completed_quests_result = await db.execute(
        select(func.count(UserQuest.id)).where(
            UserQuest.user_id == user_id, UserQuest.completed_at.isnot(None)
        )
    )
    completed_count = completed_quests_result.scalar() or 0
    sync_percent = min(int((completed_count / 5) * 100), 100)

    # 獲取種族與職業詳細資訊
    race_info = None
    class_info = None

    if hero_profile:
        race_id = hero_profile.get("race_id")
        class_id = hero_profile.get("class_id")

        if race_id:
            race_res = await db.execute(
                select(GameDefinition).where(GameDefinition.id == race_id)
            )
            race_info = race_res.scalar_one_or_none()
        if class_id:
            class_res = await db.execute(
                select(GameDefinition).where(GameDefinition.id == class_id)
            )
            class_info = class_res.scalar_one_or_none()

    quest_result = await db.execute(
        select(UserQuest)
        .where(UserQuest.user_id == user_id, UserQuest.hero_chronicle.isnot(None))
        .order_by(UserQuest.completed_at.desc())
        .limit(1)
    )
    latest_quest = quest_result.scalar_one_or_none()

    from app.services.level_system import level_service, get_exp_for_level

    # 計算等級進度資訊（累積制）
    current_level = user.level
    current_exp = user.exp

    # 計算下一級所需總經驗值
    next_level_total_exp = get_exp_for_level(current_level + 1)

    # 計算等級進度
    exp_progress = max(0.0, min(1.0, current_exp / next_level_total_exp))

    response_data = {
        "userId": str(user.id),
        "displayName": user.display_name,
        "avatarUrl": user.hero_avatar_url or "/assets/images/classes/civilian.webp",
        "heroAvatarUrl": user.hero_avatar_url,
        "heroClassId": user.hero_class_id,
        "level": user.level,
        "exp": user.exp,
        "expToNextLevel": next_level_total_exp,
        "expProgress": exp_progress,
        "questMode": level_service.get_quest_mode(user.level),
        "questionCount": level_service.get_question_count(user.level),
        "syncPercent": sync_percent,
        "heroIdentity": {
            "race": {
                "id": race_info.id if race_info else "",
                "name": race_info.name if race_info else "尚未覺醒",
                "description": (
                    race_info.metadata_info.get("description") if race_info else ""
                ),
            },
            "class": {
                "id": class_info.id if class_info else "",
                "name": class_info.name if class_info else "平民",
                "description": (
                    class_info.metadata_info.get("traits") if class_info else ""
                ),
            },
        },
        "heroProfile": hero_profile,
        "latestChronicle": latest_quest.hero_chronicle if latest_quest else "",
    }

    await CacheService.set_user_profile(str(user_id), response_data)

    return response_data
