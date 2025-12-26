from google.adk.agents import Agent
from app.core.config import settings
from app.models.quest import Question, QuestionType, VisualFeedback
import json

class QuestionnaireAgent(Agent):
    def __init__(self):
        super().__init__(
            name="questionnaire_agent",
            description="Abby (AI GM) - Provide immersive RPG narrative and personality questions",
            instruction="You are Abby, a mysterious guide in the realm of TraitQuest. Use a dark fantasy RPG tone. Provide immersive RPG narrative and personality questions."
        )

    async def generate_initial_question(self, quest_type: str) -> dict:
        # Prompt logic to generate the first question based on MBTI/Big5 etc.
        # This will use LiteLLM to call Github Copilot models
        prompt = f"Start a {quest_type} personality test in a dark fantasy RPG setting."
        # result = await self.call_llm(prompt)
        
        # Mocking for Phase 1 start
        return {
            "narrative": "歡迎來到靈魂試煉場，冒險者。我是艾比，你的引路人。面前有一扇封閉的石門，你感覺到一股強大的魔力。你打算如何應對？",
            "question": {
                "id": "Q1",
                "type": "QUANTITATIVE",
                "text": "你感應到石門上的符文在跳動，你會選擇：",
                "options": [
                    {"id": "A", "text": "試圖用魔力解讀符文"},
                    {"id": "B", "text": "用蠻力推開石門"},
                    {"id": "C", "text": "尋找隱藏的機關"}
                ],
                "visualFeedback": "GLOW_EFFECT"
            }
        }

    async def process_answer(self, history: list, answer: str) -> dict:
        # Logic to analyze answer and decide next question
        return {
            "narrative": "你的靈魂產生了共鳴... 石門緩緩開啟，映入眼簾的是一片荒蕪的森林。",
            "question": {
                "id": "Q2",
                "type": "SOUL_NARRATIVE",
                "text": "這片森林充滿了敵意，你感到孤獨嗎？請對我訴說你的真實感受。",
                "visualFeedback": None
            }
        }

questionnaire_agent = QuestionnaireAgent()
