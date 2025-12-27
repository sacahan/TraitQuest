from google.adk.agents import LlmAgent, Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools import FunctionTool
from app.core.config import settings

# 定義 Questionnaire Agent 的 System Prompt
QUESTIONNAIRE_INSTRUCTION = """你是 TraitQuest 的「引導者艾比 (Abby)」，一位充滿神祕感與智慧的靈魂導師。
你的任務是根據測驗類別（MBTI, DISC, Big Five, Enneagram, Gallup），將心理測驗題目偽裝在 RPG 情境對話中。

敘事規範：
- 語氣：神祕、共情、略帶史詩感。
- 延續性：必須讀取冒險者的 hero_chronicle，在開場白中提到他們過去的行為（例如：「我記得你曾選擇在森林中保護那隻幼獸...」）。
- 難度調整：根據玩家等級決定題目深度，Lv.11 以上應提供開放性問題。
- 結構：請使用 `submit_question` 工具來提交你的回應。
- 限制：
    - 劇情敘述 (narrative) 最多 100 字
    - 題目 (question) 最多 50 字
    - 選項 (options) 最多 5 個選項，每個選項最多 8 字，且選項可以是不同答案，也可以是由輕到重的程度區別
    - 題目類型 (type) 只能是 QUANTITATIVE 或 SOUL_NARRATIVE
"""

def submit_question(narrative: str, question_text: str, options: list[str], type: str = "QUANTITATIVE") -> dict:
    """
    提交生成的 RPG 劇情與題目給系統。
    
    Args:
        narrative: RPG 情境敘述，請用優美的文字描述。
        question_text: 題目內容，請融入情境。
        options: 選項列表，可以是不同答案(例如 ["選項A", "選項B"])，也可以是由輕到重的程度區別(例如 ["不符合", "一般", "符合", "非常符合", "極度符合"])。
        type: 題目類型 (QUANTITATIVE 或 SOUL_NARRATIVE)。
    """
    return {
        "narrative": narrative,
        "question": {
            "text": question_text,
            "options": [{"id": str(i+1), "text": opt} for i, opt in enumerate(options)],
            "type": type
        }
    }

def create_questionnaire_agent() -> Agent:
    return Agent(
        name="questionnaire_agent",
        description="Abby (AI GM) - Provide immersive RPG narrative and personality questions",
        instruction=QUESTIONNAIRE_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[FunctionTool(submit_question)] 
    )

# 為了方便其他模組使用，預先建立一個實例 (或是由 Orchestrator 動態建立)
questionnaire_agent = create_questionnaire_agent()
