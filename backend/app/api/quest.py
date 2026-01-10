from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
import uuid

from app.db.session import get_db
from app.db.models import UserQuest
from app.models.schemas import QuestReport
from app.core.security import decode_access_token
from app.services.level_system import get_exp_for_level

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter(prefix="/quests", tags=["quests"])

class QuestInfo(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    difficulty: str
    total_steps: int

class RegionInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    status: str  # "LOCKED", "UNLOCKED", "CONQUERED"
    progress: int
    color: str
    preview_image: str

class QuestResult(BaseModel):
    sessionId: str
    race_id: str
    class_id: str
    stats: dict
    summary: str

@router.get("", response_model=List[QuestInfo])
async def list_quests():
    """取得系統支援的測驗列表"""
    return [
        {
            "id": "mbti",
            "title": "靈魂顯影儀 (MBTI)",
            "description": "探索你性格的深層構造...",
            "icon": "sparkles",
            "difficulty": "Easy",
            "total_steps": 10
        },
        {
            "id": "bigfive",
            "title": "五維之鏡 (Big Five)",
            "description": "最科學的人格分析工具...",
            "icon": "shield",
            "difficulty": "Medium",
            "total_steps": 15
        }
    ]

@router.get("/{sessionId}/result", response_model=QuestResult)
async def get_quest_result(sessionId: str, db: AsyncSession = Depends(get_db)):
    """取得測驗最終分析結果 (Mock)"""
    # 這裡未來應從資料庫查詢對應 sessionId 的分析結果
    return {
        "sessionId": sessionId,
        "race_id": "RACE_5",
        "class_id": "CLS_INTJ",
        "stats": {"O": 80, "C": 70, "E": 60, "A": 90, "N": 40},
        "summary": "你是一位冷靜、機智且深具洞察力的策略家..."
    }

@router.get("/report/{quest_type}", response_model=QuestReport)
async def get_quest_report(
    quest_type: str,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    取得指定類型測驗的最新報告

    Args:
        quest_type: 測驗類型 (mbti, bigfive, disc, enneagram, gallup)

    Returns:
        quest_report: 該測驗的完整分析報告 (QuestReport)，並包含 hero_chronicle
    """
    # 驗證 Token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user_id = uuid.UUID(user_id_str)

    # 查詢最新的 UserQuest
    result = await db.execute(
        select(UserQuest)
        .where(
            UserQuest.user_id == user_id,
            UserQuest.quest_type == quest_type,
            UserQuest.quest_report.isnot(None),
        )
        .order_by(UserQuest.completed_at.desc())
        .limit(1)
    )
    quest = result.scalar_one_or_none()

    if not quest:
        raise HTTPException(status_code=404, detail="Quest report not found")

    # 組合 QuestReport
    report_data = quest.quest_report.copy()

    # [FIX] 注入必要欄位 quest_type (schema 要求)
    report_data["quest_type"] = quest.quest_type

    # [FIX] 動態注入 expToNextLevel 和 expProgress
    if "level_info" in report_data and report_data["level_info"]:
        level_info = report_data["level_info"]
        current_level = level_info.get("level", 1)
        current_exp = level_info.get("exp", 0)

        # 計算下一級所需總經驗值（累積制）
        next_level_total_exp = get_exp_for_level(current_level + 1)
        level_info["expToNextLevel"] = next_level_total_exp

        # 計算當前等級進度
        current_level_exp_threshold = get_exp_for_level(current_level)
        exp_in_current_level = current_exp - current_level_exp_threshold
        exp_needed_for_next = next_level_total_exp - current_level_exp_threshold

        if exp_needed_for_next > 0:
            level_info["expProgress"] = max(
                0.0, min(1.0, exp_in_current_level / exp_needed_for_next)
            )
        else:
            level_info["expProgress"] = 0.0

    # 注入 hero_chronicle
    if quest.hero_chronicle:
        report_data["hero_chronicle"] = quest.hero_chronicle

    return report_data


@router.get("/map", response_model=List[RegionInfo])
async def get_map_regions():
    """取得地圖區域狀態"""
    return [
        {
            "id": "mbti",
            "name": "MBTI 聖殿",
            "description": "16型人格迷宮，尋找本命職業。",
            "icon": "account_balance",
            "status": "CONQUERED",
            "progress": 100,
            "color": "#22d3ee",
            "preview_image": "/assets/images/map/region_mbti.png"
        },
        {
            "id": "bigfive",
            "name": "Big Five 屬性之泉",
            "description": "在生命之泉中照見真實自我，繪製你的個性雷達。",
            "icon": "water_drop",
            "status": "UNLOCKED",
            "progress": 0,
            "color": "#10b981",
            "preview_image": "/assets/images/map/region_big5.png"
        },
        {
            "id": "enneagram",
            "name": "Enneagram 冥想塔",
            "description": "探索靈魂的奧秘，揭示你內心的真實種族面貌。",
            "icon": "temple_hindu",
            "status": "UNLOCKED",
            "progress": 0,
            "color": "#a78bfa",
            "preview_image": "/assets/images/map/region_enneagram.png"
        },
        {
            "id": "disc",
            "name": "DISC 戰鬥叢林",
            "description": "在叢林法則中，D.I.S.C 四大流派，誰主沈浮？",
            "icon": "swords",
            "status": "UNLOCKED",
            "progress": 0,
            "color": "#dc2626",
            "preview_image": "/assets/images/map/region_disc.png"
        },
        {
            "id": "gallup",
            "name": "Gallup 祭壇",
            "description": "此聖地被魔法屏障封鎖。需先完成「DISC 戰鬥叢林」方可進入。",
            "icon": "diamond",
            "status": "LOCKED",
            "progress": 40,
            "color": "#fbbf24",
            "preview_image": "/assets/images/map/region_gallup.png"
        }
    ]
