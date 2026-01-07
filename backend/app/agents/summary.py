import logging
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

SUMMARY_INSTRUCTION = """你是 TraitQuest 的「史官」。你的任務是將玩家與艾比 (Abby) 之間的瑣碎對話，提煉為具有傳奇色彩的「英雄史詩」(Hero Chronicle)。

目標：
1. **提煉核心**：壓縮長對話，提取玩家在測驗中表現出的核心決策、價值觀與性格閃光點。
2. **傳奇敘事**：採用第三人稱敘事。語氣應莊重、史詩感，且具備神秘氣息。例如：「這位冒險者在面對深淵的誘惑時，選擇了堅守內心的純粹...」。
3. **精煉長度**：摘要必須限制在 300 字以內，確保後續 Agent 能快速讀取。
4. **輸出規範**：你唯一的輸出必須是調用 `submit_summary` 工具。使用正體中文。
"""

def submit_summary(
    hero_chronicle: str,
    tool_context: ToolContext
) -> dict:
    """
    提交生成的英雄史詩摘要。
    
    Args:
        hero_chronicle: 第三人稱敘事的傳奇史詩摘要。
        tool_context: 工具上下文。
    """
    # 限制長度
    if len(hero_chronicle) > 500: # 緩衝一下
        hero_chronicle = hero_chronicle[:497] + "..."
    
    result = {"hero_chronicle": hero_chronicle}
    tool_context.state["summary_output"] = result

    logger.info("📜 New Hero Chronicle Summary Generated")
    return result

def create_summary_agent() -> Agent:
    return Agent(
        name="summary_agent",
        description="Chronicler - Summarize long dialogues into legendary Hero Chronicle",
        instruction=SUMMARY_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[submit_summary]
    )

summary_agent = create_summary_agent()
