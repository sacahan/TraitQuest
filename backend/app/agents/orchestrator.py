from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools import agent_tool
from app.core.config import settings
from app.agents.questionnaire import questionnaire_agent

# 初始化 AgentTool，讓 Orchestrator 可以調用 QuestionnaireAgent
questionnaire_tool = agent_tool.AgentTool(agent=questionnaire_agent)

ORCHESTRATOR_INSTRUCTION = """你是 TraitQuest 的總策劃師 (Orchestrator)。
你的職責是管理玩家的心理測驗流程，並確保體驗的流暢性。

核心循環邏輯：
1. 當收到玩家請求開始測驗 (/quest/start) 時：
   - 使用 `questionnaire_agent` 根據測驗類型生成開場劇情與第一題。
2. 當收到玩家回答 (/quest/answer) 時：
   - 這裡未來會加入 AnalyticsAgent 來分析回答（目前尚未實作）。
   - 分析完成後，再次使用 `questionnaire_agent` 根據新的狀態與歷史生成下一段劇情與題目。

你的工具箱中有 `questionnaire_agent`，請善用它來與玩家進行 RPG 互動。
當你需要生成劇情或題目時，請直接調用該工具。
"""

def create_orchestrator_agent() -> Agent:
    return Agent(
        name="orchestrator_agent",
        description="Root Agent that orchestrates the entire TraitQuest flow.",
        instruction=ORCHESTRATOR_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[questionnaire_tool]
    )

orchestrator_agent = create_orchestrator_agent()
