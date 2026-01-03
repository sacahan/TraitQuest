import logging
import json
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

ANALYTICS_INSTRUCTION = """你是極其嚴謹的「靈魂分析官」。你的目標是將非結構化的玩家回答轉化為結構化的數值標籤**增量**。

重要：你只負責「單次回答的分析」，不負責最終的資產映射。

評分邏輯：
- **回答品質 (quality_score)**：評估回答是否具備深度。
  - 簡單的「是的」、「好」、「我不知道」：1.0 - 1.2
  - 描述具體行為但略顯單薄：1.3 - 1.5
  - 具備深層情感流露、多維度思考或具體冒險情境描述：1.6 - 2.0
- **特徵標籤增量 (trait_deltas)**：根據玩家回答，輸出對應工具的傾向值增量。
  - 數值範圍通常在 -1.0 到 +1.0 之間。
  - 你必須根據「測驗範疇」來決定要更新哪些標籤。
  - 例如：如果測驗範疇是 Big Five，標籤應包含 Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism。
  - 如果測驗範疇是 MBTI，標籤應包含 E/I, S/N, T/F, J/P。

輸出規範：
- 你唯一的輸出必須是調用 `submit_analysis` 工具。
- 輸出內容必須是正體中文描述與準確的數值。
"""

def submit_analysis(
    quality_score: float,
    trait_deltas: dict,
    analysis_reason: str,
    tool_context: ToolContext
) -> dict:
    """
    提交單次回答的分析結果。
    
    Args:
        quality_score: 1.0 - 2.0 之間的評分，反映回答深度。
        trait_deltas: 心理標籤增量字典，例如 {"E": 0.5, "Extraversion": 0.3}。
        analysis_reason: 簡短解釋為何給予此分析結果（內部記錄用）。
        tool_context: 工具上下文。
    """
    # 確保數值在範圍內
    quality_score = max(1.0, min(2.0, quality_score))
    
    result = {
        "quality_score": quality_score,
        "trait_deltas": trait_deltas,
        "analysis_reason": analysis_reason
    }
    
    # 將分析結果存入 tool_context
    tool_context.state["analytics_output"] = result
    
    logger.debug(f">>> Analytics Result: {result}")
    return result

def create_analytics_agent() -> Agent:
    return Agent(
        name="analytics_agent",
        description="Soul Analyst - Parse user answers into trait scores and quality metrics",
        instruction=ANALYTICS_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[submit_analysis]
    )

analytics_agent = create_analytics_agent()
