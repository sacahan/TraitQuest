import json
import logging
import asyncio
import uuid
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from app.core.security import decode_access_token
from app.core.session import session_service
from app.core.redis_client import redis_client
from app.agents.transformation import transformation_agent
from app.agents.summary import summary_agent
from app.services.level_system import level_service
from app.services.game_assets import game_assets_service
from app.db.session import AsyncSessionLocal
from app.db.models import User, UserQuest
from sqlalchemy import select, update, func

from app.api.quest_utils import (
    get_user_display_name,
    run_agent_async,
    run_analytics_task,
    get_total_steps,
    get_hero_chronicle,
    run_questionnaire_agent,
    get_or_create_session,
    manager,
    QUESTIONNAIRE_NAME
)

logger = logging.getLogger("app")

router = APIRouter(prefix="/quests", tags=["quests"])

@router.websocket("/ws")
async def quest_ws_endpoint(
    websocket: WebSocket,
    sessionId: str = Query(...),
    token: str = Query(...)
):
    """
    WebSocket 主入口：處理玩家的即時測驗流程
    
    流程：
    1. 驗證 JWT Token
    2. 建立 WebSocket 連線
    3. 進入無限迴圈處理前端事件 (Event Loop)
    """

    # 1. JWT 身份驗證
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid Token")
        return
    
    user_id = payload.get("sub") or "test_user"
    display_name = await get_user_display_name(user_id)
    
    # 2. 建立連線並註冊到 ConnectionManager
    await manager.connect(sessionId, websocket)
    
    try:
        # 初始化 Session (如果是新連線)
        # 確保在開始對話前，Session Service 中已有此 Session 記錄
        await get_or_create_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)

        # 進入訊息處理迴圈 (Event Loop)
        while True:
            # 接收前端消息
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            event_type = data.get("event")
            payload = data.get("data", {})
            
            # 3. 讀取玩家當前狀態 (Level, Exp)
            # 這會影響題目數量與難度
            async with AsyncSessionLocal() as db_session:
                user_stmt = select(User).where(User.id == uuid.UUID(user_id))
                user_result = await db_session.execute(user_stmt)
                user = user_result.scalar_one_or_none()
                player_level = user.level if user else 1
                player_exp = user.exp if user else 0

            # 4. 從 Session 恢復當前任務狀態 (Context Restoration)
            questionnaire_session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
            quest_id = questionnaire_session.state.get("current_quest_id", "mbti")

            logger.info(f"📥 [{event_type}]: Lv.{player_level}, Quest: {quest_id} ({sessionId})")
            
            # --- 處理：開始新測驗 ---
            if event_type == "start_quest":
                quest_id = payload.get("questId", "mbti")
                total_steps = get_total_steps(quest_id, player_level)
                
                # 初始化 Session State
                questionnaire_session.state["current_quest_id"] = quest_id
                questionnaire_session.state["total_steps"] = total_steps
                questionnaire_session.state["accumulated_analytics"] = [] # 清空分析緩衝區
                questionnaire_session.state["interactions"] = [] # 重置對話歷程
                
                # [Fix] Explicitly save session state initialization
                await session_service.update_session(questionnaire_session)
                
                # 在資料庫建立 UserQuest 紀錄 (標記測驗開始)
                async with AsyncSessionLocal() as db_session:
                    new_quest = UserQuest(
                        user_id=uuid.UUID(user_id),
                        quest_type=quest_id,
                        interactions=[]
                    )
                    db_session.add(new_quest)
                    await db_session.commit()
                
                # 讀取玩家的歷史記憶摘要（用於維持敘事連貫性）
                hero_chronicle = await get_hero_chronicle(user_id)
                chronicle_context = ""
                if hero_chronicle:
                    chronicle_context = f"\n\n[玩家歷史摘要]：{hero_chronicle}\n"
                
                # 取得試煉模式資訊
                quest_mode = level_service.get_quest_mode(player_level)

                # 指令：生成具有代入感的開場白與第一題
                instruction = (
                    f"玩家 {display_name} (等級 {player_level})，開啟了 {quest_id} 試煉。 "
                    f"本次試煉總題數設定為 {total_steps} 題。"
                    f"玩家模式：{quest_mode['name']}（{quest_mode['description']}）。"
                    f"{chronicle_context}"
                    f"請生成一個符合 {quest_id} 試煉情境的開場白，並直接提供第一道題目與選項。"
                )

                logger.info(f">>> Instruction: {instruction}")
                result = await run_questionnaire_agent(user_id, sessionId, instruction)
                logger.info(f"<<< Result: {result}")

                # 確保第一題有 ID
                if result.get("question") and not result["question"].get("id"):
                    result["question"]["id"] = f"q_0_{sessionId[:8]}"
                
                result["questionIndex"] = 0
                result["totalSteps"] = total_steps
                await manager.send_event(sessionId, "next_question", result)

            # --- 處理：玩家提交回答 ---
            elif event_type == "submit_answer":
                answer = payload.get("answer")
                question_index = payload.get("questionIndex", 0)
                
                # 獲取當前題目上下文 (為了給 Analytics Agent 分析使用)
                # [Optimization] Use existing session object
                current_question_text = ""
                q_output = questionnaire_session.state.get("questionnaire_output", {})
                current_options = []
                if isinstance(q_output, dict):
                    question_data = q_output.get("question", {})
                    current_question_text = question_data.get("text", "")
                    current_options = question_data.get("options", [])
                    current_type = question_data.get("type", "QUANTITATIVE")

                # 紀錄互動內容到 Session
                if "interactions" not in questionnaire_session.state:
                    questionnaire_session.state["interactions"] = []
                questionnaire_session.state["interactions"].append(
                    {
                        "question": q_output.get("question", {}),
                        "answer": answer,
                        "type": current_type,
                    }
                )
                
                # [Fix] Explicitly save session state (interactions)
                await session_service.update_session(questionnaire_session)

                # 即時同步 interactions 到資料庫
                async with AsyncSessionLocal() as db_session:
                    quest_stmt = select(UserQuest).where(
                        UserQuest.user_id == uuid.UUID(user_id),
                        UserQuest.quest_type == quest_id
                    ).order_by(UserQuest.created_at.desc()).limit(1)
                    
                    quest_res = await db_session.execute(quest_stmt)
                    quest = quest_res.scalar_one_or_none()
                    
                    if quest:
                        quest.interactions = questionnaire_session.state["interactions"]
                        await db_session.commit()
                        logger.debug(f"💾 Synced {len(questionnaire_session.state['interactions'])} interactions to DB")


                # [平行處理] 啟動後台分析任務 (Non-blocking)
                # 這允許分析與下一題生成同時進行，提升響應速度
                analysis_task = asyncio.create_task(
                    run_analytics_task(
                        user_id,
                        sessionId,
                        current_question_text,
                        answer,
                        quest_id,
                        options=current_options,
                        question_type=current_type,
                    )
                )
                manager.pending_tasks[sessionId].append(analysis_task)
                
                # 計算題號
                current_num = question_index + 1
                next_num = current_num + 1
                
                # 判斷是否為最後一題 (使用 session 中的 total_steps，如果沒有則重新計算)
                total_steps = questionnaire_session.state.get("total_steps") or get_total_steps(quest_id, player_level)
                
                if current_num >= total_steps:
                     instruction = (
                         f"玩家 {display_name} (等級 {player_level}) 對於最後一題（第 {current_num} 題 / 共 {total_steps} 題）的回答是：{answer}。 "
                         f"試煉已達上限，請務必使用 complete_trial 工具結束測驗，並給予一段感性的結語。"
                     )
                else:
                     # 讀取当前 Session 中的對話歷程，作為上下文
                     interactions = questionnaire_session.state.get("interactions", [])
                     recent_context = ""
                     if len(interactions) >= 2:
                         # 取最近 2 題作為上下文
                         recent = interactions[-2:]
                         context_parts = []
                         for i, item in enumerate(recent):
                             q_text = item.get("question", {}).get("text", "")
                             a_text = item.get("answer", "")
                             if q_text:
                                 context_parts.append(f"第{len(interactions)-1+i}題: {q_text} -> 回答: {a_text}")
                         if context_parts:
                             recent_context = f"\n[近期對話上下文]：" + "; ".join(context_parts) + "\n"
                     
                     instruction = (
                         f"{recent_context}"
                         f"玩家 {display_name} (等級 {player_level}) 對於第 {current_num} 題（共 {total_steps} 題）的回答是：{answer}。 "
                         f"請生成下一題（第 {next_num} 題 / 共 {total_steps} 題）的情境與題目。"
                     )
                
                # 執行 Agent 生成下一題或結語
                logger.info(f">>> Instruction: {instruction}")
                result = await run_questionnaire_agent(user_id, sessionId, instruction)
                logger.info(f"<<< Result: {result}")
                
                # 檢查 Agent 是否標記了測驗結束 (透過 complete_trial 工具)
                updated_session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
                
                if updated_session.state.get("quest_completed"):
                     # 發送完成訊號，前端將顯示等待轉場動畫
                     await manager.send_event(sessionId, "quest_complete", {
                        "message": updated_session.state.get("final_message", "Hero transformation in progress..."),
                        "totalExp": 100
                    })
                else:
                    # 發送下一題
                    result["questionIndex"] = question_index + 1
                    result["totalSteps"] = total_steps
                    if result.get("question") and not result["question"].get("id"):
                        result["question"]["id"] = f"q_{result['questionIndex']}_{str(uuid.uuid4())[:8]}"
                    
                    await manager.send_event(sessionId, "next_question", result)

            # --- 處理：請求最終結果 (The Grand Mapping) ---
            elif event_type == "request_result":
                """
                最終結算階段 (Aggregation & Transformation)
                1. 等待所有 Analytics Agent 任務完成
                2. 聚合 (Reduce) 所有分析數據
                3. Transformation Agent: 將心理數據映射為遊戲資產
                4. [Refactored] Use Code Logic for Validation: 驗證資產合法性 (取代 Agent)
                5. Summary Agent: 生成英雄史詩摘要
                6. 寫入資料庫 & 升級
                """
                
                # 1. 確保所有背景分析任務已完成
                tasks = manager.pending_tasks.get(sessionId, [])
                if tasks:
                    logger.info(f"⏳ 1. Waiting for {len(tasks)} analytics tasks to finish")
                    await asyncio.gather(*tasks)
                
                # 2. 聚合 (Reduce) 所有分析結果
                logger.info("⏳ 2. Aggregating all analysis results")
                questionnaire_session = await session_service.get_session(app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=sessionId)
                analytics_list = questionnaire_session.state.get("accumulated_analytics", [])
                
                total_quality = 0
                for item in analytics_list:
                    total_quality += item.get("quality_score", 1.0)
                
                avg_quality = total_quality / len(analytics_list) if analytics_list else 1.0
                
                # 3. 執行 Transformation Agent (核心映射邏輯)
                logger.info("🧙‍♂️ 3. Running Transformation Agent...")
                
                # 設置 quest_type 供 callback 驗證使用
                transformation_session = await get_or_create_session(
                    app_name="transformation",
                    user_id=user_id,
                    session_id=sessionId
                )
                transformation_session.state["quest_type"] = quest_id
                await session_service.update_session(transformation_session)

                t_instruction = f"當前測驗類型：{quest_id}\n累積心理數據：{json.dumps(analytics_list, ensure_ascii=False)}"
                
                logger.info(f">>> Instruction: {t_instruction}")
                transformation_raw = await run_agent_async(
                    agent=transformation_agent,
                    app_name="transformation",
                    user_id=user_id,
                    session_id=sessionId,
                    instruction=t_instruction,
                    output_key="transformation_output"
                )
                logger.info(f"<<< Result: {transformation_raw}")
                quest_report = transformation_raw

                # 4. 執行 Summary Agent (生成史詩摘要)
                logger.info("📝 4. Running Summary Agent...")
                # 使用 accumulated_analytics 作為資料來源，已分析結果更精確
                history_text = "\n".join(
                    [
                        f"第 {idx + 1} 題:\n  分析結果: {item.get('analysis_reason', 'N/A')}\n 特徵增量: {item.get('trait_deltas', {})}"
                        for idx, item in enumerate(analytics_list)
                    ]
                )
                s_instruction = f"玩家對話分析摘要：\n{history_text}"
                
                logger.info(f">>> Summary Instruction (using accumulated_analytics): {s_instruction[:200]}...")
                summary_result = await run_agent_async(
                    agent=summary_agent,
                    app_name="summary",
                    user_id=user_id,
                    session_id=sessionId,
                    instruction=s_instruction,
                    output_key="summary_output"
                )
                logger.info(f"<<< Result: {summary_result}")
                
                # 處理摘要結果 (應為 {"hero_chronicle": "..."})
                hero_chronicle = ""
                if isinstance(summary_result, dict):
                    hero_chronicle = summary_result.get("hero_chronicle", "")
                
                if not hero_chronicle:
                    hero_chronicle = f"冒險者 {display_name} 在 {quest_id} 試煉中留下了足跡。"

                # 5. 計算經驗值與升級 (Level Service - 累計制)
                logger.info("5. Calculating experience and level up...")
                num_questions = len(analytics_list)
                logger.info(
                    f"📊 EXP Calc: {num_questions} questions, Avg Quality: {avg_quality:.2f}"
                )
                earned_exp = level_service.calculate_quest_exp(
                    num_questions, avg_quality
                )
                new_total_exp = player_exp + earned_exp  # 累計總 EXP
                new_lvl, _, is_up = level_service.check_level_up(
                    player_level, new_total_exp
                )

                # 計算等級進度資訊
                progress_info = level_service.get_level_progress(new_total_exp)
                
                # 6. 持久化存入資料庫
                logger.info("6. Persisting to database...")
                async with AsyncSessionLocal() as db_session:
                    user_uuid = uuid.UUID(user_id)
                    
                    # a) 更新 User Profile (等級、經驗值、新職業、完整英雄檔案)
                    hero_class_id = quest_report.get("class_id")
                    
                    update_values = {
                        "level": new_lvl,
                        "exp": new_total_exp,  # 儲存累計總 EXP
                    }

                    # 更新頭像與職業 ID（如果是 MBTI 測驗）
                    if hero_class_id:
                        filename = hero_class_id.lower() + ".webp"
                        update_values["hero_class_id"] = hero_class_id
                        update_values["hero_avatar_url"] = f"/assets/images/classes/{filename}"
                    
                    # 更新完整英雄檔案（合併策略）
                    user_stmt = select(User).where(User.id == user_uuid)
                    user_result = await db_session.execute(user_stmt)
                    user = user_result.scalar_one_or_none()
                    
                    if user:
                        from app.models.schemas import merge_hero_profile
                        existing_profile = user.hero_profile or {}
                        merged_profile = merge_hero_profile(existing_profile, quest_report)
                        update_values["hero_profile"] = merged_profile

                    await db_session.execute(
                        update(User).where(User.id == user_uuid).values(**update_values)
                    )
                    
                    # b) 存入 UserQuest 紀錄（quest_report 與 hero_chronicle）
                    quest_stmt = select(UserQuest).where(
                        UserQuest.user_id == user_uuid,
                        UserQuest.quest_type == quest_id
                    ).order_by(UserQuest.created_at.desc()).limit(1)
                    quest_res = await db_session.execute(quest_stmt)
                    quest = quest_res.scalar_one_or_none()
                    
                    if quest:
                        # 構造 QuestReport（包含完整 level_info）
                        db_report = quest_report.copy()
                        db_report["quest_type"] = quest_id
                        db_report["level_info"] = {
                            "level": new_lvl,
                            "exp": new_total_exp,
                            "expToNextLevel": progress_info["next_threshold"],
                            "expProgress": progress_info["progress"],
                            "isLeveledUp": is_up,
                            "earnedExp": earned_exp,
                        }
                        
                        quest.quest_report = db_report
                        quest.hero_chronicle = hero_chronicle
                        quest.completed_at = func.now()
                    
                    await db_session.commit()

                # 7. 回傳最終結果給前端
                logger.info("7. Returning final result to frontend...")
                quest_report["levelInfo"] = {
                    "level": new_lvl,
                    "exp": new_total_exp,
                    "expToNextLevel": progress_info["next_threshold"],
                    "expProgress": progress_info["progress"],
                    "isLeveledUp": is_up,
                    "earnedExp": earned_exp,
                }

                if is_up:
                    milestone = level_service.get_level_milestone(new_lvl)
                    if milestone:
                        quest_report["levelInfo"]["milestone"] = milestone
                
                await manager.send_event(sessionId, "final_result", quest_report)

    except WebSocketDisconnect:
        manager.disconnect(sessionId)
    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}")
        await manager.send_event(sessionId, "error", {"message": str(e)})
        manager.disconnect(sessionId)
