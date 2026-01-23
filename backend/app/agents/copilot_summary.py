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
