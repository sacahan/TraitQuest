import logging
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from app.db.models import User, UserQuest
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
        "unlock_level": 2,
        "prerequisite": "mbti"
    },
    {
        "id": "enneagram",
        "name": "Enneagram 冥想塔",
        "description": "靈魂種族的探索之塔",
        "unlock_level": 3,
        "prerequisite": "big_five"
    },
    {
        "id": "disc",
        "name": "DISC 戰鬥叢林",
        "description": "戰略姿態的實踐之地",
        "unlock_level": 4,
        "prerequisite": "enneagram"
    },
    {
        "id": "gallup",
        "name": "Gallup 祭壇",
        "description": "傳奇技能的傳承祭壇",
        "unlock_level": 5,
        "prerequisite": "disc"
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
                # 檢查先決條件 (Prerequisite) - 這是硬性門檻
                pre_ok = True
                if config["prerequisite"]:
                    if config["prerequisite"] == "ALL":
                        # (雖然現在配置中沒有用 ALL，但保留邏輯)
                        others = [r["id"] for r in REGIONS_CONFIG if r["id"] != region_id]
                        pre_ok = all(q in completed_quests for q in others)
                    else:
                        pre_ok = config["prerequisite"] in completed_quests
                
                # 檢查等級條件 (Level)
                lvl_ok = player_level >= config["unlock_level"]
                
                # 判定狀態：必須滿足 先決條件 AND 等級條件
                if pre_ok and lvl_ok:
                    status = "AVAILABLE"
                    hint = None
                else:
                    status = "LOCKED"
                    if not pre_ok:
                         # 優先提示先決條件
                         prereq_name = next((r["name"] for r in REGIONS_CONFIG if r["id"] == config["prerequisite"]), config["prerequisite"])
                         hint = f"需先完成【{prereq_name}】試煉"
                    else:
                         # 其次提示等級
                         hint = f"需達到等級 Lv.{config['unlock_level']}"
            
            regions_status.append({
                "id": region_id,
                "name": config["name"],
                "status": status,
                "unlock_hint": hint
            })
            
        return {"regions": regions_status}

@router.get("/check-access")
async def check_access(region_id: str = Query(...), token: str = Query(...)):
    """檢查玩家是否可進入指定區域。"""
    payload = decode_access_token(token)
    if not payload:
        return {"error": "Unauthorized"}
    
    user_id = payload.get("sub")
    
    # 找尋對應的區域配置
    config = next((r for r in REGIONS_CONFIG if r["id"] == region_id), None)
    if not config:
        return {"error": "Region not found", "can_enter": False}

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
        
        # 3. 判定邏輯 (與 regions 列表邏輯保持一致)
        # 已完成
        if region_id in completed_quests:
            return {
                "can_enter": True,
                "status": "CONQUERED",
                "message": "試煉已完成"
            }
        
        # 檢查先決條件
        pre_ok = True
        if config["prerequisite"]:
            # 這裡只處理單一依賴，若需支援 ALL 邏輯需擴充
            pre_ok = config["prerequisite"] in completed_quests
            
        # 檢查等級條件
        lvl_ok = player_level >= config["unlock_level"]
        
        if pre_ok and lvl_ok:
             return {
                "can_enter": True,
                "status": "AVAILABLE",
                "message": "允許進入"
            }
        else:
            hint = ""
            if not pre_ok:
                 prereq_name = next((r["name"] for r in REGIONS_CONFIG if r["id"] == config["prerequisite"]), config["prerequisite"])
                 hint = f"需先完成【{prereq_name}】試煉"
            else:
                 hint = f"需達到等級 Lv.{config['unlock_level']}"
            
            return {
                "can_enter": False,
                "status": "LOCKED",
                "message": hint
            }
