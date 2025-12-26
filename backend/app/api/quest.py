from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.quest import QuestResponse, QuestInteractionRequest
from app.agents.questionnaire import questionnaire_agent
import uuid

router = APIRouter(prefix="/quests", tags=["quests"])

@router.post("/{questId}/start", response_model=QuestResponse)
async def start_quest(questId: str, db: AsyncSession = Depends(get_db)):
    # In Phase 1, we focus on MBTI
    if questId != "mbti":
        raise HTTPException(status_code=404, detail="Quest type not supported yet")
    
    session_id = str(uuid.uuid4())
    result = await questionnaire_agent.generate_initial_question(questId)
    
    # Store session in Redis normally, but for MVP we return it directly
    return QuestResponse(
        sessionId=session_id,
        narrative=result["narrative"],
        question=result["question"],
        isCompleted=False
    )

@router.post("/interact", response_model=QuestResponse)
async def interact(request: QuestInteractionRequest, db: AsyncSession = Depends(get_db)):
    # Logic to process answer and get next question
    result = await questionnaire_agent.process_answer([], request.answer)
    
    return QuestResponse(
        sessionId=request.sessionId,
        narrative=result["narrative"],
        question=result["question"],
        isCompleted=False
    )
