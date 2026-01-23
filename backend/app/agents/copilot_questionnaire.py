"""
Copilot SDK 版本 - Questionnaire Agent

使用 GitHub Copilot SDK
"""
import logging
import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from app.core.tools import create_copilot_tool
from app.core.config import settings

logger = logging.getLogger("app")


class SubmitQuestionParams(BaseModel):
    narrative: str = Field(description="RPG 情境敘述")
    question_text: str = Field(description="題目內容")
    options: List[str] = Field(description="選項列表")
    type: str = Field(default="QUANTITATIVE", description="題目類型")
    guide_message: str = Field(default="", description="嚮導話語")

class CompleteTrialParams(BaseModel):
    final_message: str = Field(description="結業語")


async def submit_question(params: SubmitQuestionParams) -> dict:
    """提交生成的 RPG 劇情與題目"""
    output = {
        "narrative": params.narrative,
        "question": {
            "text": params.question_text,
            "options": [{"id": str(i+1), "text": opt} for i, opt in enumerate(params.options)],
            "type": params.type
        }
    }
    if params.guide_message:
        output["guideMessage"] = params.guide_message
    return output


async def complete_trial(params: CompleteTrialParams) -> dict:
    """完成測驗"""
    return {
        "is_completed": True,
        "message": params.final_message
    }


def create_questionnaire_tools() -> list:
    """建立工具列表"""
    return [
        create_copilot_tool(
            name="submit_question",
            description="提交 RPG 情境敘述與題目",
            handler=submit_question,
            params_model=SubmitQuestionParams
        ),
        create_copilot_tool(
            name="complete_trial",
            description="完成所有測驗題目",
            handler=complete_trial,
            params_model=CompleteTrialParams
        ),
    ]


def get_questionnaire_session_id(user_id: str, session_id: str) -> str:
    return f"questionnaire_{user_id}_{session_id}"
