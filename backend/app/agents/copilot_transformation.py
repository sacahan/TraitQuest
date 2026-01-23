"""
Copilot SDK 版本 - Transformation Agent

使用 GitHub Copilot SDK
"""
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from app.core.tools import create_copilot_tool
from app.core.config import settings

logger = logging.getLogger("app")


class TransformationParams(BaseModel):
    race_id: Optional[str] = Field(default=None, description="靈魂種族 ID")
    race: Optional[dict] = Field(default=None, description="種族完整物件")
    class_id: Optional[str] = Field(default=None, description="英雄職業 ID")
    hero_class: Optional[dict] = Field(default=None, description="職業完整物件")
    stats: Optional[dict] = Field(default=None, description="五大屬性數值")
    stance_id: Optional[str] = Field(default=None, description="戰略姿態 ID")
    stance: Optional[dict] = Field(default=None, description="姿態完整物件")
    talent_ids: Optional[List[str]] = Field(default=None, description="傳奇技能 ID 列表")
    talents: Optional[List[dict]] = Field(default=None, description="技能完整物件列表")
    destiny_guide: dict = Field(description="命運指引字典")
    destiny_bonds: dict = Field(description="命運羈絆字典")


async def submit_transformation(params: TransformationParams) -> dict:
    """提交最終的英雄轉生報告"""
    result = {}
    
    if params.stats is not None: result["stats"] = params.stats
    if params.race_id is not None: result["race_id"] = params.race_id
    if params.race is not None: result["race"] = params.race
    if params.class_id is not None: result["class_id"] = params.class_id
    if params.hero_class is not None: result["class"] = params.hero_class
    if params.stance_id is not None: result["stance_id"] = params.stance_id
    if params.stance is not None: result["stance"] = params.stance
    if params.talent_ids is not None: result["talent_ids"] = params.talent_ids
    if params.talents is not None: result["talents"] = params.talents
    
    result["destiny_guide"] = params.destiny_guide
    result["destiny_bonds"] = params.destiny_bonds
    
    return result


def create_transformation_tools() -> list:
    """建立工具列表"""
    return [
        create_copilot_tool(
            name="submit_transformation",
            description="提交英雄轉生結果",
            handler=submit_transformation,
            params_model=TransformationParams
        ),
    ]


def get_transformation_session_id(user_id: str, session_id: str) -> str:
    return f"transformation_{user_id}_{session_id}"
