from pydantic import BaseModel
from typing import List, Optional, Union
from enum import Enum

class QuestionType(str, Enum):
    QUANTITATIVE = "QUANTITATIVE"
    SOUL_NARRATIVE = "SOUL_NARRATIVE"

class VisualFeedback(str, Enum):
    GLOW_EFFECT = "GLOW_EFFECT"
    PULSE_EFFECT = "PULSE_EFFECT"

class Option(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: str
    type: QuestionType
    text: str
    options: Optional[List[Option]] = None
    visualFeedback: Optional[VisualFeedback] = None

class QuestInteractionRequest(BaseModel):
    sessionId: str
    questId: str
    answer: str

class QuestResponse(BaseModel):
    sessionId: str
    narrative: str
    question: Optional[Question] = None
    isCompleted: bool = False
    expGained: Optional[int] = 0

class QuestWSEvent(BaseModel):
    event: str
    data: dict
