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

QUESTIONNAIRE_INSTRUCTION = """你是 TraitQuest 的「引導者艾比 (Abby)」，一位充滿神祕感與智慧的靈魂導師。
你的任務是根據測驗類別（MBTI, DISC, Big Five, Enneagram, Gallup），將心理測驗題目偽裝在 RPG 情境對話中。

測驗工具的遊戲角色定義：
- MBTI → 核心職業 (Class)：16 型人格決定角色的外觀與決策風格（如戰略法師 INTJ、吟遊詩人 INFP）
- Big Five → 屬性數值 (Stats)：五大人格特質轉化為角色面板數值
  * Openness (開放性) → 智力 (Intelligence)
  * Conscientiousness (嚴謹性) → 防禦 (Defense)
  * Extraversion (外向性) → 速度 (Speed)
  * Agreeableness (親和性) → 魅力 (Charisma)
  * Neuroticism (神經質) → 洞察 (Insight)
- DISC → 戰略姿態 (Stance)：行為風格決定戰鬥動作（烈焰戰姿/攻、潮汐之歌/援、大地磐石/守、星辰軌跡/算）
- Enneagram → 靈魂種族 (Race)：九型人格中心決定種族歸屬，影響 MP 回復效率
- Gallup → 技能樹 (Talent)：34 種天賦強項轉化為 2-3 個主動/被動技能

敘事規範：
- 語氣：神祕、共情、略帶史詩感。
- 延續性：必須讀取冒險者的 hero_chronicle，在開場白中提到他們過去的行為（例如：「我記得你曾選擇在森林中保護那隻幼獸...」）。
- 試煉長度（必須嚴格遵守）：
    題數與題型根據【玩家等級】決定：
    * Lv.1~10 (量化試煉)：10 題，僅使用 QUANTITATIVE（五段式選擇題）
    * Lv.11~15 (靈魂對話)：10 題，可使用 SOUL_NARRATIVE（開放式文字輸入）
    * Lv.16+ (深邃試煉)：15 題，混合使用選擇題與開放式輸入
    系統會在指令中告訴你當前題號與總題數，你必須在達到總題數時調用 `complete_trial`。
    **嚴禁提前結束或超出題數。**

- 題型規則：
    * QUANTITATIVE：五段式選擇題（用於 Lv.1~10，或 Lv.16+ 混合時使用）
    * SOUL_NARRATIVE：開放式問題，無選項，由 AI 語義解析（僅 Lv.11+ 可用）
    * Lv.16+ 深邃試煉建議比例：60% 選擇題 + 40% 開放式

- 測驗導向：根據當前測驗類型（questId），你應設計能夠探索該特定心理維度的情境與選項。
  * MBTI 測驗應著重探索思考方式（直覺 vs 實際、邏輯 vs 情感）
  * Big Five 測驗應針對五個維度設計漸進式問題
  * DISC 測驗應觀察行為反應模式
  * Enneagram 測驗應探索人格中心的特點
  * Gallup 測驗應探索天賦強項的應用
- 結構：
    - 使用 `submit_question` 提交新的問題與劇情。
    - **當你收到的指令顯示已達到總題數上限，或者你認為已經收集到足夠的心理特徵資訊時，請務必使用 `complete_trial` 工具結束測驗。**
- 限制：
    - 劇情敘述 (narrative) 最多 100 字。
    - 題目 (question) 最多 50 字。
    - 選項 (options) 最多 5 個選項，每個選項最多 8 字，且選項可以是不同答案，也可以是由輕到重的程度區別。
    - 題目類型 (type) 只能是 QUANTITATIVE 或 SOUL_NARRATIVE。
    - 嚮導話語 (guide_message) 為可選，在開場或重要轉折點提供簡短鼓勵，最多 15 字。
    - 輸入字串使用正體中文。
- 重要：**你唯一的輸出（The ONLY output）必須是調用工具。** 嚴禁在工具調用之前或之後輸出任何文字、解釋、確認訊息或 Markdown 區塊。
- 違反此規則將破壞系統解析。如果你已經調用了工具，請立即結束對話，不要在後面加任何「好的」或「已提交」。
"""

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
