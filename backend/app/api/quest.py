from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.quest import QuestResponse, QuestInteractionRequest
from app.agents.orchestrator import orchestrator_agent
from google.adk.services.session.in_memory_session_service import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
import uuid
import json

router = APIRouter(prefix="/quests", tags=["quests"])

# 初始化 Session Service (單例模式)
# 理想上應該用 Redis-backed Session Service，但 MVP 先用 InMemory
session_service = InMemorySessionService()

@router.post("/{questId}/start", response_model=QuestResponse)
async def start_quest(questId: str, db: AsyncSession = Depends(get_db)):
    if questId != "mbti":
        raise HTTPException(status_code=404, detail="Quest type not supported yet")
    
    session_id = str(uuid.uuid4())
    user_id = "test_user" # MVP 先固定 user_id，未來從 auth 取得
    
    # 1. 建立 Session
    session = await session_service.create_session(
        app_name="TraitQuest",
        user_id=user_id,
        session_id=session_id
    )
    
    # 2. 初始化 Runner
    runner = Runner(
        agent=orchestrator_agent, 
        app_name="TraitQuest", 
        session_service=session_service
    )
    
    # 3. 觸發 Orchestrator 開始測驗
    instruction = f"Player {session_id} starts a {questId} quest. Please guide them by using the questionnaire tool."
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    
    narrative = "連結建立中..."
    question_data = {"id":"loading", "text":"請稍候...", "type":"QUANTITATIVE", "options":[]}
    
    # 4. 執行 Runner Loop 並捕捉 Tool Output
    async for event in runner.run_async(session.user_id, session.id, user_msg):
        # 檢查是否有 Tool Call 的回應被存入 State (假設我們有設定 output_key)
        # 或者直接檢查 Event 的內容
        
        # 暫時解法：我們檢查 Tool 執行後的 State 變更，或者直接解析 Event 的內容
        # ADK 的 Tool 執行結果通常會在隨後的 Model Response 中被引用
        # 但我們在 QuestionnaireAgent 的 submit_question Tool 中回傳了 dict
        # 我們需要攔截這個 dict。
        
        # 進階解法：Orchestrator 應該會把 Tool 的結果 "說" 出來
        # 或者我們直接看最後一個 Model Response
        if event.content and event.content.parts:
            # 嘗試解析最後的回應是否包含我們需要的 JSON 結構
             for part in event.content.parts:
                if part.text:
                    try:
                        # 嘗試尋找並解析 JSON 區塊
                        text = part.text
                        if "```json" in text:
                            json_str = text.split("```json")[1].split("```")[0].strip()
                            data = json.loads(json_str)
                            if "narrative" in data and "question" in data:
                                narrative = data["narrative"]
                                question_data = data["question"]
                    except:
                        pass
        
        # 如果是 Tool Call Event，我們可以查看是否有 submit_question 被呼叫
        # (這裡簡化處理，直接依賴 Orchestrator 的最終口述回傳)

    return QuestResponse(
        sessionId=session_id,
        narrative=narrative,
        question=question_data,
        isCompleted=False
    )

@router.post("/interact", response_model=QuestResponse)
async def interact(request: QuestInteractionRequest, db: AsyncSession = Depends(get_db)):
    user_id = "test_user"
    
    # 1. 獲取現有 Session (InMemory Service 需要確保 Server 沒重啟)
    try:
        session = await session_service.get_session("TraitQuest", user_id, request.sessionId)
    except:
        # 如果 Session 遺失 (InMemory 重啟後)，需重新建立或報錯
        # MVP 這裡寬容處理，重新建立 Session，但注意 Context 可能遺失
        session = await session_service.create_session("TraitQuest", user_id, request.sessionId)

    runner = Runner(
        agent=orchestrator_agent, 
        app_name="TraitQuest", 
        session_service=session_service
    )
    
    instruction = f"Player answers: {request.answer}. Continue the quest."
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    
    narrative = "..."
    question_data = {"id":"next", "text":"...", "type":"QUANTITATIVE", "options":[]}

    async for event in runner.run_async(session.user_id, session.id, user_msg):
        if event.content and event.content.parts:
             for part in event.content.parts:
                if part.text:
                    try:
                        text = part.text
                        if "```json" in text:
                            json_str = text.split("```json")[1].split("```")[0].strip()
                            data = json.loads(json_str)
                            if "narrative" in data and "question" in data:
                                narrative = data["narrative"]
                                question_data = data["question"]
                    except:
                        pass
    
    return QuestResponse(
        sessionId=request.sessionId,
        narrative=narrative,
        question=question_data,
        isCompleted=False
    )
