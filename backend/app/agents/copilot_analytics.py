"""
Copilot SDK 版本 - Analytics Agent

使用 GitHub Copilot SDK
"""
import logging
from typing import Dict, Any
from pydantic import BaseModel, Field

from app.core.tools import create_copilot_tool
from app.core.config import settings

logger = logging.getLogger("app")


class SubmitAnalysisParams(BaseModel):
    quality_score: float = Field(description="1.0 - 2.0 之間的評分")
    trait_deltas: Dict[str, float] = Field(description="心理維度增量字典")
    analysis_reason: str = Field(description="評分理由")


async def submit_analysis(params: SubmitAnalysisParams) -> dict:
    """提交單次回答的分析結果"""
    quality_score = max(1.0, min(2.0, params.quality_score))
    
    return {
        "quality_score": quality_score,
        "trait_deltas": params.trait_deltas,
        "analysis_reason": params.analysis_reason
    }


def create_analytics_tools() -> list:
    """建立工具列表"""
    return [
        create_copilot_tool(
            name="submit_analysis",
            description="提交心理維度分析結果",
            handler=submit_analysis,
            params_model=SubmitAnalysisParams
        ),
    ]


def get_analytics_session_id(user_id: str, session_id: str) -> str:
    return f"analytics_{user_id}_{session_id}"
