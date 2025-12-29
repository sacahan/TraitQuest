import asyncio
import json
import logging
import sys
from unittest.mock import MagicMock

# Pad the path to import app
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.quest_ws import parse_agent_response
from google.adk.events.event import Event
from google.genai import types

# Configure logging to see output
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test")

async def test_parsing():
    # Scenario 1: Tool Call (Function Call)
    print("\n--- Scenario 1: Tool Call ---")
    tool_call_part = types.Part(
        function_call=types.FunctionCall(
            name="submit_question",
            args={
                "narrative": "你來到了一座神祕的祭壇...",
                "question_text": "你會獻上什麼祭品？",
                "options": ["金幣", "鮮血", "祈禱"]
            }
        )
    )
    event1 = Event(author="abby", content=types.Content(parts=[tool_call_part]))
    
    async def runner_iter1():
        yield event1

    narrative, question, _ = await parse_agent_response(runner_iter1())
    print(f"Narrative: {narrative}")
    print(f"Question: {question}")
    assert narrative == "你來到了一座神祕的祭壇..."
    assert question["text"] == "你會獻上什麼祭品？"
    assert len(question["options"]) == 3

    # Scenario 2: Markdown JSON in Text
    print("\n--- Scenario 2: Markdown JSON ---")
    json_text = """這是一個引導文字。
```json
{
  "narrative": "森林深處傳來低語...",
  "question": {
    "text": "你決定走向哪裡？",
    "options": [{"id": "1", "text": "左邊"}, {"id": "2", "text": "右邊"}],
    "type": "QUANTITATIVE"
  }
}
```"""
    text_part = types.Part(text=json_text)
    event2 = Event(author="abby", content=types.Content(parts=[text_part]))
    
    async def runner_iter2():
        yield event2

    narrative, question, _ = await parse_agent_response(runner_iter2())
    print(f"Narrative: {narrative}")
    print(f"Question: {question}")
    assert narrative == "森林深處傳來低語..."
    assert question["text"] == "你決定走向哪裡？"

    # Scenario 3: Plain Text Fallback
    print("\n--- Scenario 3: Plain Text Fallback ---")
    plain_text = "你站在山頂，風很大。你感覺如何？"
    text_part3 = types.Part(text=plain_text)
    event3 = Event(author="abby", content=types.Content(parts=[text_part3]))
    
    async def runner_iter3():
        yield event3

    narrative, question, _ = await parse_agent_response(runner_iter3())
    print(f"Narrative: {narrative}")
    print(f"Question: {question}")
    assert narrative == "你站在山頂，風很大。你感覺如何？"
    assert question is None # Current logic fallback only sets narrative

    print("\n✅ All scenarios passed!")

if __name__ == "__main__":
    asyncio.run(test_parsing())
