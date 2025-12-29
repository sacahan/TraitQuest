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
            "id": "big_five",
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
