"""
Copilot SDK 版本 - Summary Agent

使用 GitHub Copilot SDK
"""
import logging
from typing import Dict, Any
from pydantic import BaseModel, Field

from app.core.tools import create_copilot_tool
from app.core.config import settings

logger = logging.getLogger("app")

SUMMARY_INSTRUCTION = """你是 TraitQuest 的「史官」。你的任務是將玩家與艾比 (Abby) 之間的瑣碎對話，提煉為具有傳奇色彩的「英雄史詩」(Hero Chronicle)。

目標：
1. **提煉核心**：壓縮長對話，提取玩家在測驗中表現出的核心決策、價值觀與性格閃光點。
2. **傳奇敘事**：採用第三人稱敘事。語氣應莊重、史詩感，且具備神秘氣息。例如：「這位冒險者在面對深淵的誘惑時，選擇了堅守內心的純粹...」。
3. **真實分析**： 你必須基於玩家在測驗中的表現進行真實的分析而不是隨便編造，並推論出玩家未來的預言或注意事項。
4. **精煉長度**：摘要必須限制在 150 字以內，確保後續 Agent 能快速讀取。
5. **輸出規範**：你唯一的輸出必須是調用 `submit_summary` 工具。使用正體中文。
"""

class SubmitSummaryParams(BaseModel):
    hero_chronicle: str = Field(description="第三人稱敘事的傳奇史詩摘要")


async def submit_summary(params: SubmitSummaryParams) -> dict:
    """提交生成的英雄史詩摘要"""
    hero_chronicle = params.hero_chronicle
    if len(hero_chronicle) > 500:
        hero_chronicle = hero_chronicle[:497] + "..."
    
    return {"hero_chronicle": hero_chronicle}


def create_summary_tools() -> list:
    """建立工具列表"""
    return [
        create_copilot_tool(
            name="submit_summary",
            description="提交英雄史詩摘要",
            handler=submit_summary,
            params_model=SubmitSummaryParams
        ),
    ]


def get_summary_session_id(user_id: str, session_id: str) -> str:
    return f"summary_{user_id}_{session_id}"
