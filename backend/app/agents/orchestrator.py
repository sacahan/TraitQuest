from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools import agent_tool
from app.core.config import settings
from app.agents.questionnaire import questionnaire_agent

# 初始化 AgentTool，讓 Orchestrator 可以調用 QuestionnaireAgent
questionnaire_tool = agent_tool.AgentTool(agent=questionnaire_agent)

ORCHESTRATOR_INSTRUCTION = """你是 TraitQuest 的總策劃師 (Orchestrator)。
你的職責是協調各個 Agent，確保測驗流程順暢。

**重要規則：**
1. 你只負責「調用工具」，不要自己生成任何劇情、題目或對話內容。
2. 所有與玩家的互動內容都由 `questionnaire_agent` 負責生成。
3. 你的唯一任務是：根據玩家的請求，調用正確的 Agent 工具。

**工作流程：**
- 當收到任何玩家請求時，直接調用 `questionnaire_agent` 工具。
- 不要在調用工具後再添加任何額外的文字或說明。
- 不要嘗試總結或解釋 questionnaire_agent 的輸出。
- 調用工具後，你的任務就完成了。

**禁止行為：**
- ❌ 不要生成「試煉正式開始！」之類的開場白
- ❌ 不要嘗試總結或解釋 questionnaire_agent 的輸出
- ❌ 不要輸出任何「收到」、「好的」或任何確認語句
- ❌ 你的輸出應該「僅包含」對工具的調用。如果已經調用了工具，請立即結束 turn。

記住：你是協調者，不是內容生成者。讓專業的 Agent 做專業的事。
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
