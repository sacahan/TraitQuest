import json
import logging
import asyncio
import uuid
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from app.core.security import decode_access_token
from app.core.session import session_service
from app.agents.orchestrator import orchestrator_agent
from app.models.quest import QuestWSEvent, QuestResponse
from google.adk.runners import Runner
from google.genai import types

logger = logging.getLogger("app")

async def run_analytics_task(session_id: str, answer: str):
    """後台任務：執行 Analytics Agent 並寫入資料庫 (目前為 Mock)"""

    try:
        logger.info(f"🧠 [Background] Starting analysis for session {session_id}")
        # 這裡未來會調用 analytics_agent
        await asyncio.sleep(2) # 模擬分析延遲
        logger.info(f"✅ [Background] Analysis complete for session {session_id}")
    except Exception as e:
        logger.error(f"Error in background analytics task: {e}")

# 基礎題數配置
BASE_STEPS = {
    "mbti": 10,
    "big_five": 15,
    "disc": 10,
    "enneagram": 10,
    "gallup": 10,
}

def get_total_steps(quest_id: str, level: int = 1) -> int:
    """根據測驗類型與玩家等級計算總題數。"""
    base = BASE_STEPS.get(quest_id, 10)
    if level <= 10:
        return base
    elif level <= 20:
        return int(base * 1.5)
    else:
        return base * 2

router = APIRouter(prefix="/quests", tags=["quests"])

app_name = "agents"

class ConnectionManager:
    """管理 WebSocket 連線"""

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

async def run_agent_cycle(user_id: str, session_id: str, instruction: str):
    """
    通用助手：執行 Agent 對話循環，並從 Session State 獲取最終結果。
    
    Args:
        user_id: 每個使用者的唯一標識
        session_id: 前端生成的 Session ID
        instruction: 輸入給 Agent 的文字指令 (User Message)
        
    Returns:
        dict: 包含 narrative, question, guideMessage 的字典
    """
    logger.info(f"🔄 [run_agent_cycle] Starting cycle for session {session_id}")
    
    # 1. 獲取 Session 與 Runner
    session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)
    runner = Runner(agent=orchestrator_agent, app_name=app_name, session_service=session_service)
    
    # 2. 準備訊息並執行
    user_msg = types.Content(role="user", parts=[types.Part(text=instruction)])
    logger.info(f"🔄 User message: {instruction}")
    
    # 3. 消費 Event Stream (讓 Agent 執行並調用工具)
    async for event in runner.run_async(user_id=user_id, session_id=session.id, new_message=user_msg):
        if event.actions and event.actions.end_of_agent:
            logger.debug("🏁 Agent execution cycle completed")
            
    # 4. 從 Session State 讀取最終結果 (Single Source of Truth)
    final_session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)
    questionnaire_output = final_session.state.get("questionnaire_output", {})
    logger.info(f"🏁 Final session state: {final_session.state}")
    
    # 5. 安全解析與格式化
    if isinstance(questionnaire_output, str):
         try:
             questionnaire_output = json.loads(questionnaire_output)
         except:
             questionnaire_output = {}
             
    narrative = questionnaire_output.get("narrative", "")
    question_data = questionnaire_output.get("question")
    guide_message = questionnaire_output.get("guideMessage", "")
    
    return {
        "narrative": narrative,
        "question": question_data,
        "guideMessage": guide_message
    }

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
        # 初始化 Session (如果是新連線)
        await session_service.create_session(app_name=app_name, user_id=user_id, session_id=sessionId)
    except Exception as e:
        logger.debug(f"Session already exists or error creating: {e}")

    # 追蹤當前測驗 ID
    quest_id = "mbti"

    try:
        while True:
            # 等待前端訊息
            data = await websocket.receive_text()
            message = QuestWSEvent.model_validate_json(data)
            
            event_type = message.event
            payload = message.data
            
            logger.info(f"📥 Received event: {event_type} for session {sessionId}")
            
            if event_type == "start_quest":
                quest_id = payload.get("questId", "mbti")
                player_level = 1 # TODO: 從玩家資料取得
                total_steps = get_total_steps(quest_id, player_level)
                
                instruction = (
                    f"玩家等級 {player_level}，開啟了 {quest_id} 試煉。 "
                    f"本次試煉總題數設定為 {total_steps} 題。 "
                    f"請先生成一個充滿神祕感且符合 {quest_id} 背景的開場白，暫時不需生成具體問題。"
                )
                
                result = await run_agent_cycle(user_id, sessionId, instruction)
                if result.get("question") and not result["question"].get("id"):
                    result["question"]["id"] = f"q_start_{sessionId[:8]}"
                
                result["totalSteps"] = total_steps
                await manager.send_event(sessionId, "first_question", result)

            elif event_type == "continue_quest":
                player_level = 1
                total_steps = get_total_steps(quest_id, player_level)
                
                instruction = (
                    f"玩家已準備好開始。當前進度：第 1 題 / 共 {total_steps} 題。 "
                    f"請開始為 {quest_id} 測驗生成第一個 RPG 情境與題目。"
                )
                
                result = await run_agent_cycle(user_id, sessionId, instruction)
                
                # 補充 index 與 ID
                result["questionIndex"] = 0
                result["totalSteps"] = total_steps
                if result.get("question") and not result["question"].get("id"):
                    result["question"]["id"] = f"q_0_{sessionId[:8]}"
                    
                await manager.send_event(sessionId, "next_question", result)

            elif event_type == "submit_answer":
                answer = payload.get("answer")
                question_index = payload.get("questionIndex", 0)
                player_level = 1
                total_steps = get_total_steps(quest_id, player_level)
                
                # 啟動後台分析任務 (非阻塞)
                analysis_task = asyncio.create_task(run_analytics_task(sessionId, answer))
                manager.pending_tasks[sessionId].append(analysis_task)
                
                # 執行 Agent 獲取下一題
                # question_index 從 0 開始，所以當前回答的是第 question_index + 1 題
                current_num = question_index + 1
                next_num = current_num + 1
                
                if current_num >= total_steps:
                     instruction = (
                         f"玩家對於最後一題（第 {current_num} 題 / 共 {total_steps} 題）的回答是：{answer}。 "
                         f"試煉已達上限，請務必使用 complete_trial 工具結束測驗，並給予一段感性的結語。"
                     )
                else:
                     instruction = (
                         f"玩家對於第 {current_num} 題（共 {total_steps} 題）的回答是：{answer}。 "
                         f"請生成下一題（第 {next_num} 題 / 共 {total_steps} 題）的情境與題目。"
                     )
                
                result = await run_agent_cycle(user_id, sessionId, instruction)
                
                # 從最新 session state 檢查是否結束 (由 Agent 調用 complete_trial 決定)
                updated_session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=sessionId)
                
                if updated_session.state.get("quest_completed"):
                     await manager.send_event(sessionId, "quest_complete", {
                        "message": updated_session.state.get("final_message", "Hero transformation in progress..."),
                        "totalExp": 100
                    })
                else:
                    result["questionIndex"] = question_index + 1
                    result["totalSteps"] = total_steps
                    # 確保問題有 ID
                    if result.get("question") and not result["question"].get("id"):
                        result["question"]["id"] = f"q_{result['questionIndex']}_{str(uuid.uuid4())[:8]}"
                    
                    await manager.send_event(sessionId, "next_question", result)

                    
            elif event_type == "request_result":
                # 測驗結束後的結果請求
                # 1. 等待所有分析完畢
                tasks = manager.pending_tasks.get(sessionId, [])
                if tasks:
                    logger.info(f"⏳ 等待 {len(tasks)} tasks 完成 for session {sessionId}")
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
