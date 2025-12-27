import json
import logging
import asyncio
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from app.core.security import decode_access_token
from app.core.session import session_service
from app.agents.orchestrator import orchestrator_agent
from app.models.quest import QuestWSEvent, QuestResponse
from google.adk.runners import Runner
from google.genai import types

logger = logging.getLogger("app")
router = APIRouter(prefix="/quests", tags=["quests"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.pending_tasks: Dict[str, List[asyncio.Task]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.pending_tasks[session_id] = []
        logger.info(f"🔌 WebSocket Connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.pending_tasks:
            # Note: Background tasks should ideally be allowed to finish or handled gracefully
            del self.pending_tasks[session_id]
        logger.info(f"🔌 WebSocket Disconnected: {session_id}")

    async def send_event(self, session_id: str, event: str, data: dict):
        if session_id in self.active_connections:
            try:
                message = {"event": event, "data": data}
                await self.active_connections[session_id].send_json(message)
            except Exception as e:
                logger.error(f"Failed to send event to {session_id}: {e}")

manager = ConnectionManager()

async def parse_agent_response(runner_iterator):
    """助手函數：從 ADK Runner 疊代器中提取 JSON 回應"""
    narrative = ""
    question_data = None
    is_completed = False
    
    async for event in runner_iterator:
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    try:
                        text = part.text
                        if "```json" in text:
                            json_str = text.split("```json")[1].split("```")[0].strip()
                            data = json.loads(json_str)
                            if "narrative" in data:
                                narrative = data["narrative"]
                            if "question" in data:
                                question_data = data["question"]
                            if data.get("isCompleted"):
                                is_completed = True
                        elif not narrative:
                            # 備用：讀取純文字作為 narrative
                            narrative = text
                    except Exception as e:
                        logger.warning(f"Failed to parse JSON from agent: {e}")
    
    return narrative, question_data, is_completed

async def run_analytics_task(session_id: str, answer: str):
    """後台任務：執行 Analytics Agent 並寫入資料庫 (目前為 Mock)"""
    try:
        logger.info(f"🧠 [Background] Starting analysis for session {session_id}")
        # 這裡未來會調用 analytics_agent
        await asyncio.sleep(2) # 模擬分析延遲
        logger.info(f"✅ [Background] Analysis complete for session {session_id}")
    except Exception as e:
        logger.error(f"Error in background analytics task: {e}")

@router.websocket("/ws")
async def quest_ws_endpoint(
    websocket: WebSocket,
    sessionId: str = Query(...),
    token: str = Query(...)
):
    # 1. 認證
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid Token")
        return
    
    user_id = payload.get("sub") or "test_user"
    
    # 2. 建立連線
    await manager.connect(sessionId, websocket)
    
    try:
        while True:
            # 等待前端訊息
            data = await websocket.receive_text()
            message = QuestWSEvent.model_validate_json(data)
            
            event_type = message.event
            payload = message.data
            
            logger.info(f"📥 Received event: {event_type} for session {sessionId}")
            
            # 3. 處理事件
            if event_type == "start_quest":
                quest_id = payload.get("questId", "mbti")
                
                # 初始化 ADK Session
                session = await session_service.create_session("TraitQuest", user_id, sessionId)
                runner = Runner(agent=orchestrator_agent, app_name="TraitQuest", session_service=session_service)
                
                instruction = f"Player starts a {quest_id} quest. Please guide them with the first question."
                user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
                
                # 執行並解析
                narrative, question_data, _ = await parse_agent_response(runner.run_async(user_id, session.id, user_msg))
                
                # 回傳給前端
                await manager.send_event(sessionId, "first_question", {
                    "narrative": narrative,
                    "question": question_data
                })
                
            elif event_type == "submit_answer":
                answer = payload.get("answer")
                question_index = payload.get("questionIndex", 0)
                
                # 啟動後台分析任務 (非阻塞)
                analysis_task = asyncio.create_task(run_analytics_task(sessionId, answer))
                manager.pending_tasks[sessionId].append(analysis_task)
                
                # 同步處理下一題
                session = await session_service.get_session("TraitQuest", user_id, sessionId)
                runner = Runner(agent=orchestrator_agent, app_name="TraitQuest", session_service=session_service)
                
                instruction = f"Player answered question {question_index}: {answer}. Continue the quest with the next question."
                user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
                
                narrative, question_data, is_completed = await parse_agent_response(runner.run_async(user_id, session.id, user_msg))
                
                if is_completed:
                    await manager.send_event(sessionId, "quest_complete", {
                        "message": "Hero transformation in progress...",
                        "totalExp": 100
                    })
                    # 此處未來會執行 wait_for_tasks + TransformationAgent
                else:
                    await manager.send_event(sessionId, "next_question", {
                        "narrative": narrative,
                        "question": question_data,
                        "questionIndex": question_index + 1
                    })
                    
            elif event_type == "request_result":
                # 測驗結束後的結果請求
                # 1. 等待所有分析完畢
                tasks = manager.pending_tasks.get(sessionId, [])
                if tasks:
                    logger.info(f"⏳ Waiting for {len(tasks)} tasks to complete for session {sessionId}")
                    await asyncio.gather(*tasks)
                
                # 2. 模擬 Transformation Agent 結果
                await asyncio.sleep(1)
                await manager.send_event(sessionId, "final_result", {
                    "race_id": "RACE_5",
                    "class_id": "CLS_INTJ",
                    "stats": {"O": 80, "C": 70, "E": 60, "A": 90, "N": 40}
                })

    except WebSocketDisconnect:
        manager.disconnect(sessionId)
    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}")
        await manager.send_event(sessionId, "error", {"message": str(e)})
        manager.disconnect(sessionId)
