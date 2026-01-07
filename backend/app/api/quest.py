from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel

from app.db.session import get_db

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
