import logging
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from app.db.models import User, UserQuest, Trait
from app.db.session import AsyncSessionLocal
from app.core.security import decode_access_token

logger = logging.getLogger("app")
router = APIRouter(prefix="/map", tags=["map"])

REGIONS_CONFIG = [
    {
        "id": "mbti",
        "name": "MBTI 聖殿",
        "description": "核心職業的覺醒之地",
        "unlock_level": 1,
        "prerequisite": None
    },
    {
        "id": "big_five",
        "name": "Big Five 能量場",
        "description": "基礎屬性的磨練之場",
        "unlock_level": 1,
        "prerequisite": None
    },
    {
        "id": "enneagram",
        "name": "Enneagram 冥想塔",
        "description": "靈魂種族的探索之塔",
        "unlock_level": 3,
        "prerequisite": "mbti"
    },
    {
        "id": "disc",
        "name": "DISC 戰鬥叢林",
        "description": "戰略姿態的實踐之地",
        "unlock_level": 5,
        "prerequisite": "big_five"
    },
    {
        "id": "gallup",
        "name": "Gallup 祭壇",
        "description": "傳奇技能的傳承祭壇",
        "unlock_level": 8,
        "prerequisite": "ALL" # 特別邏輯
    }
]

@router.get("/regions")
async def get_map_regions(token: str = Query(...)):
    """獲取玩家的地圖區域狀態。"""
    payload = decode_access_token(token)
    if not payload:
        return {"error": "Unauthorized"}
    
    user_id = payload.get("sub")
    
    async with AsyncSessionLocal() as db_session:
        # 1. 獲取玩家等級
        user_stmt = select(User).where(User.id == user_id)
        user_res = await db_session.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        player_level = user.level if user else 1
        
        # 2. 獲取已完成的測驗
        quest_stmt = select(UserQuest.quest_type).where(UserQuest.user_id == user_id, UserQuest.completed_at.isnot(None))
        quest_res = await db_session.execute(quest_stmt)
        completed_quests = set(row[0] for row in quest_res)
        
        # 3. 計算每個區域的狀態
        regions_status = []
        for config in REGIONS_CONFIG:
            region_id = config["id"]
            
            # 已完成
            if region_id in completed_quests:
                status = "CONQUERED"
                hint = "試煉已完成"
            else:
                # 檢查解鎖條件
                lvl_ok = player_level >= config["unlock_level"]
                
                pre_ok = True
                if config["prerequisite"] == "ALL":
                    # 除了 gallup 以外都必須完成
                    others = [r["id"] for r in REGIONS_CONFIG if r["id"] != "gallup"]
                    pre_ok = all(q in completed_quests for q in others)
                elif config["prerequisite"]:
                    pre_ok = config["prerequisite"] in completed_quests
                
                if lvl_ok or pre_ok:
                    status = "AVAILABLE"
                    hint = None
                else:
                    status = "LOCKED"
                    if not lvl_ok and config["prerequisite"]:
                        hint = f"達到 Lv.{config['unlock_level']} 或完成 {config['prerequisite']} 試煉解鎖"
                    elif not lvl_ok:
                        hint = f"達到 Lv.{config['unlock_level']} 解鎖"
                    else:
                        hint = f"完成 {config['prerequisite']} 試煉解鎖"
            
            regions_status.append({
                "id": region_id,
                "name": config["name"],
                "status": status,
                "unlock_hint": hint
            })
            
        return {"regions": regions_status}
