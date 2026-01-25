"""
Copilot SDK 版本 - Analytics Agent

使用 GitHub Copilot SDK
"""

import logging
from typing import Dict, Any

from pydantic import BaseModel, Field

from app.core.tools import define_tool
from app.core.config import settings

logger = logging.getLogger("app")

ANALYTICS_INSTRUCTION = """你是極其嚴謹的「靈魂分析官」。你的目標是將玩家的回答轉化為結構化的心理學維度評分增量。

重要：你只負責「單次回答的分析」，輸出心理維度評分增量，不負責最終的資產映射（種族、職業等由 Transformation Agent 處理）。

## 評分邏輯

### 1. 回答品質評分 (quality_score)

**針對選擇題 (QUANTITATIVE 模式)**：
- 評估答案選項與題目的心理學一致性
- 評估答案反映的性格傾向強度
- 評分範圍 1.0 - 2.0：
  - 1.0 - 1.3：答案與題目關聯性弱，選擇模糊或中性
  - 1.4 - 1.7：答案明確反映特定性格傾向
  - 1.8 - 2.0：答案強烈且一致地反映性格特徵

**針對開放式問答 (SOUL_NARRATIVE 模式)**：
- 評估回答內容的深度、情感流露、多維度思考
- 評分範圍 1.0 - 2.0：
  - 1.0 - 1.2：簡短回答如「是的」、「好」、「我不知道」
  - 1.3 - 1.5：描述具體行為但略顯單薄
  - 1.6 - 2.0：具備深層情感流露、多維度思考或具體情境描述

### 2. 心理維度評分增量 (trait_deltas)

根據玩家回答，輸出對應心理學維度的傾向值增量。數值範圍通常在 -1.0 到 +1.0 之間。
你必須根據「測驗範疇」來決定要更新哪些維度標籤。

#### 測驗範疇與對應維度：

**Enneagram (九型人格)**：
- 維度：Type1, Type2, Type3, Type4, Type5, Type6, Type7, Type8, Type9
- 範例：{"Type1": 0.3, "Type6": -0.2}
- 說明：九種性格類型，分屬本能、情感、精神三大中心

**MBTI (16型人格)**：
- 維度：E(外向)/I(內向), S(感覺)/N(直覺), T(思考)/F(情感), J(判斷)/P(感知)
- 範例：{"E": 0.5, "I": -0.5, "N": 0.3, "S": -0.3}
- 說明：四個獨立維度組合成 16 種人格類型

**Big Five (五大性格)**：
- 維度：Openness(開放性), Conscientiousness(盡責性), Extraversion(外向性), Agreeableness(親和性), Neuroticism(情緒性)
- 範例：{"Openness": 0.4, "Conscientiousness": 0.2, "Extraversion": -0.1}
- 說明：五個獨立維度，範圍 0-100

**DISC (行為風格)**：
- 維度：D(支配型-Dominance), I(影響型-Influence), S(穩健型-Steadiness), C(分析型-Compliance)
- 範例：{"D": 0.6, "S": -0.3}
- 說明：四種行為風格，反映壓力下的應對模式

**Gallup (天賦優勢)**：
- 維度：34 種天賦才能，分為四大領域
  - 執行力 (Executing)：ACH(成就), ARR(排定), BEL(信仰), CON(公平), DEL(謹慎), DIS(紀律), FOC(專注), RES(責任), RSV(修復)
  - 影響力 (Influencing)：ACT(激活), COM(統率), CMU(溝通), CPT(競爭), MAX(完美), SAD(自信), SIG(追求), WOO(取悅)
  - 關係建立 (Relationship Building)：ADP(適應), CNR(關聯), DEV(發展), EMP(共感), HAR(和諧), INC(包容), IND(個別), POS(積極), REL(交往)
  - 戰略思維 (Strategic Thinking)：ANA(分析), CTX(回顧), FUT(前瞻), IDE(理念), INP(蒐集), ITL(思維), LEA(學習), STR(戰略)
- 範例：{"ACH": 0.5, "STR": 0.4, "EMP": 0.3}
- 說明：選出最契合的 5-10 個天賦維度進行評分

## 輸出規範

- 你唯一的輸出必須是調用 `submit_analysis` 工具
- analysis_reason 必須使用正體中文，簡要說明評分理由
- 輸出的維度標籤必須與測驗範疇對應
- **嚴禁**輸出任何非工具調用的文字。不要解釋，不要輸出 JSON，直接調用工具。
"""


class SubmitAnalysisParams(BaseModel):
    quality_score: float = Field(description="1.0 - 2.0 之間的評分")
    trait_deltas: Dict[str, float] = Field(description="心理維度增量字典")
    analysis_reason: str = Field(description="評分理由")


@define_tool(
    name="submit_analysis",
    description="提交心理維度分析結果",
    params_type=SubmitAnalysisParams,
)
async def submit_analysis(params: SubmitAnalysisParams) -> dict:
    """提交單次回答的分析結果"""
    quality_score = max(1.0, min(2.0, params.quality_score))

    # 這裡可以加入 ToolsOutputCapture 以便測試，或者依賴 SDK 的事件回調
    # 為了保持兼容原本的測試邏輯（如果有的話），我們可以保留 ToolOutputCapture
    try:
        from app.core.tools import ToolOutputCapture

        ToolOutputCapture.capture(
            "submit_analysis",
            {
                "quality_score": quality_score,
                "trait_deltas": params.trait_deltas,
                "analysis_reason": params.analysis_reason,
            },
        )
    except ImportError:
        pass

    return {
        "quality_score": quality_score,
        "trait_deltas": params.trait_deltas,
        "analysis_reason": params.analysis_reason,
    }


def get_analytics_tools() -> list:
    """建立工具列表"""
    return [submit_analysis]


def get_analytics_session_id(user_id: str, session_id: str) -> str:
    return f"analytics_{user_id}_{session_id}"
