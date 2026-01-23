import asyncio
import json
import logging
import uuid
from typing import Dict, Any, Optional

from sqlalchemy import select, update, func

from app.api.quest_utils import (
    get_user_display_name,
    run_analytics_task,
    get_total_steps,
    get_hero_chronicle,
    run_questionnaire_agent,
    get_or_create_session,
    manager,
    QUESTIONNAIRE_NAME,
)
from app.core.copilot_client import copilot_manager
from app.services.level_system import level_service
from app.db.session import AsyncSessionLocal
from app.db.models import User, UserQuest
from app.services.cache_service import CacheService

logger = logging.getLogger("app")


# =============================================================================
# Copilot Agent 執行函式
# =============================================================================


async def run_copilot_transformation_agent(
    user_id: str,
    session_id: str,
    instruction: str,
    quest_type: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Transformation Agent
    """
    from app.agents.copilot_transformation import (
        get_transformation_session_id,
        create_transformation_tools,
    )
    from app.core.tools import ToolOutputCapture

    copilot_session_id = get_transformation_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_transformation_tools(),
            system_message=f"你是 TraitQuest 的轉生代理，當前測驗類型: {quest_type}，玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    return result


async def run_copilot_summary_agent(
    user_id: str,
    session_id: str,
    instruction: str,
) -> Dict[str, Any]:
    """
    使用 Copilot SDK 執行 Summary Agent
    """
    from app.agents.copilot_summary import (
        get_summary_session_id,
        create_summary_tools,
    )
    from app.core.tools import ToolOutputCapture

    copilot_session_id = get_summary_session_id(user_id, session_id)

    async def session_getter():
        return await copilot_manager.get_session(
            session_id=copilot_session_id,
            tools=create_summary_tools(),
            system_message=f"你是 TraitQuest 的史官，當前玩家 ID: {user_id}，Session ID: {session_id}",
        )

    result = await copilot_manager.send_and_wait(
        session_id=copilot_session_id,
        instruction=instruction,
        session_getter=session_getter,
    )

    ToolOutputCapture.clear()

    return result


async def handle_start_quest(
    session_id: str,
    quest_id: str,
    user_id: str,
    player_level: int,
    display_name: str,
    questionnaire_session,
) -> Dict[str, Any]:
    """
    處理開始測驗事件

    初始化 Session 狀態，並呼叫 Questionnaire Agent 生成開場白與第一題
    """
    total_steps = get_total_steps(quest_id, player_level)

    questionnaire_session.state["current_quest_id"] = quest_id
    questionnaire_session.state["total_steps"] = total_steps
    questionnaire_session.state["accumulated_analytics"] = []
    questionnaire_session.state["interactions"] = []

    await session_service.update_session(questionnaire_session)

    hero_chronicle = await get_hero_chronicle(user_id)
    chronicle_context = ""
    if hero_chronicle:
        chronicle_context = f"\n\n[玩家歷史摘要]：{hero_chronicle}\n"

    quest_mode = level_service.get_quest_mode(player_level)

    instruction = (
        f"玩家 {display_name} (等級 {player_level})，開啟了 {quest_id} 試煉。 "
        f"本次試煉總題數設定為 {total_steps} 題。"
        f"玩家模式：{quest_mode['name']}（{quest_mode['description']}）。"
        f"{chronicle_context}"
        f"請生成一個符合 {quest_id} 試煉情境的開場白，並直接提供第一道題目與選項。"
    )

    logger.info(f">>> Instruction: {instruction}")
    result = await run_questionnaire_agent(user_id, session_id, instruction)
    logger.info(f"<<< Result: {result}")

    if result.get("question") and not result["question"].get("id"):
        result["question"]["id"] = f"q_0_{session_id[:8]}"

    result["questionIndex"] = 0
    result["totalSteps"] = total_steps

    return result


async def handle_submit_answer(
    session_id: str,
    answer: str,
    question_index: int,
    user_id: str,
    quest_id: str,
    player_level: int,
    display_name: str,
    questionnaire_session,
) -> Optional[Dict[str, Any]]:
    """
    處理提交答案事件

    啟動後台分析任務，並生成下一題或結語
    """
    current_question_text = ""
    q_output = questionnaire_session.state.get("questionnaire_output", {})
    current_options = []
    if isinstance(q_output, dict):
        question_data = q_output.get("question", {})
        current_question_text = question_data.get("text", "")
        current_options = question_data.get("options", [])
        current_type = question_data.get("type", "QUANTITATIVE")

    if "interactions" not in questionnaire_session.state:
        questionnaire_session.state["interactions"] = []
    questionnaire_session.state["interactions"].append(
        {
            "question": q_output.get("question", {}),
            "answer": answer,
            "type": current_type,
        }
    )

    await session_service.update_session(questionnaire_session)

    analysis_task = asyncio.create_task(
        run_analytics_task(
            user_id,
            session_id,
            current_question_text,
            answer,
            quest_id,
            options=current_options,
            question_type=current_type,
        )
    )
    manager.pending_tasks[session_id].append(analysis_task)

    current_num = question_index + 1
    next_num = current_num + 1

    total_steps = questionnaire_session.state.get("total_steps") or get_total_steps(
        quest_id, player_level
    )

    if current_num >= total_steps:
        instruction = (
            f"玩家 {display_name} (等級 {player_level}) 對於最後一題（第 {current_num} 題 / 共 {total_steps} 題）的回答是：{answer}。 "
            f"試煉已達上限，請務必使用 complete_trial 工具結束測驗，並給予一段感性的結語。"
        )
    else:
        interactions = questionnaire_session.state.get("interactions", [])
        recent_context = ""
        if len(interactions) >= 2:
            recent = interactions[-2:]
            context_parts = []
            for i, item in enumerate(recent):
                q_text = item.get("question", {}).get("text", "")
                a_text = item.get("answer", "")
                if q_text:
                    context_parts.append(
                        f"第{len(interactions) - 1 + i}題: {q_text} -> 回答: {a_text}"
                    )
            if context_parts:
                recent_context = (
                    f"\n[近期對話上下文]：" + "; ".join(context_parts) + "\n"
                )

        instruction = (
            f"{recent_context}"
            f"玩家 {display_name} (等級 {player_level}) 對於第 {current_num} 題（共 {total_steps} 題）的回答是：{answer}。 "
            f"請生成下一題（第 {next_num} 題 / 共 {total_steps} 題）的情境與題目。"
        )

    logger.info(f">>> Instruction: {instruction}")
    result = await run_questionnaire_agent(user_id, session_id, instruction)
    logger.info(f"<<< Result: {result}")

    updated_session = await session_service.get_session(
        app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=session_id
    )

    if updated_session.state.get("quest_completed"):
        return {
            "event": "quest_complete",
            "data": {
                "message": updated_session.state.get(
                    "final_message", "Hero transformation in progress..."
                ),
                "totalExp": 100,
            },
        }
    else:
        result["questionIndex"] = question_index + 1
        result["totalSteps"] = total_steps
        if result.get("question") and not result["question"].get("id"):
            result["question"][
                "id"
            ] = f"q_{result['questionIndex']}_{str(uuid.uuid4())[:8]}"
        return {"event": "next_question", "data": result}


async def handle_request_result(
    session_id: str,
    quest_id: str,
    user_id: str,
    player_level: int,
    player_exp: int,
    display_name: str,
    questionnaire_session,
) -> Dict[str, Any]:
    """
    處理請求結果事件

    執行 Transformation Agent 與 Summary Agent，計算經驗值並寫入資料庫
    """
    from app.models.schemas import merge_hero_profile

    tasks = manager.pending_tasks.get(session_id, [])
    if tasks:
        logger.info(f"⏳ 1. Waiting for {len(tasks)} analytics tasks to finish")
        await asyncio.gather(*tasks)

    logger.info("⏳ 2. Aggregating all analysis results")
    questionnaire_session = await session_service.get_session(
        app_name=QUESTIONNAIRE_NAME, user_id=user_id, session_id=session_id
    )
    analytics_list = questionnaire_session.state.get("accumulated_analytics", [])

    total_quality = 0
    for item in analytics_list:
        total_quality += item.get("quality_score", 1.0)

    avg_quality = total_quality / len(analytics_list) if analytics_list else 1.0

    logger.info("🧙‍♂️ 3. Running Transformation Agent...")

    t_instruction = f"當前測驗類型：{quest_id}\n累積心理數據：{json.dumps(analytics_list, ensure_ascii=False)}"

    logger.info(f">>> Instruction: {t_instruction}")
    quest_report = await run_copilot_transformation_agent(
        user_id=user_id,
        session_id=session_id,
        instruction=t_instruction,
        quest_type=quest_id,
    )
    logger.info(f"<<< Result: {quest_report}")

    logger.info("📝 4. Running Summary Agent...")
    history_text = "\n".join(
        [
            f"第 {idx + 1} 題:\n  分析結果: {item.get('analysis_reason', 'N/A')}\n 特徵增量: {item.get('trait_deltas', {})}"
            for idx, item in enumerate(analytics_list)
        ]
    )
    s_instruction = f"玩家對話分析摘要：\n{history_text}"

    logger.info(f">>> Summary Instruction: {s_instruction[:200]}...")
    summary_result = await run_copilot_summary_agent(
        user_id=user_id,
        session_id=session_id,
        instruction=s_instruction,
    )
    logger.info(f"<<< Result: {summary_result}")

    hero_chronicle = ""
    if isinstance(summary_result, dict):
        hero_chronicle = summary_result.get("hero_chronicle", "")

    if not hero_chronicle:
        hero_chronicle = f"冒險者 {display_name} 在 {quest_id} 試煉中留下了足跡。"

    logger.info("5. Calculating experience and level up...")
    num_questions = len(analytics_list)
    logger.info(
        f"📊 EXP Calc: {num_questions} questions, Avg Quality: {avg_quality:.2f}"
    )
    earned_exp = level_service.calculate_quest_exp(num_questions, avg_quality)
    new_total_exp = player_exp + earned_exp
    new_lvl, _, is_up = level_service.check_level_up(player_level, new_total_exp)

    progress_info = level_service.get_level_progress(new_total_exp)

    logger.info("6. Persisting to database...")
    async with AsyncSessionLocal() as db_session:
        user_uuid = uuid.UUID(user_id)

        hero_class_id = quest_report.get("class_id")

        update_values = {
            "level": new_lvl,
            "exp": new_total_exp,
        }

        if hero_class_id:
            filename = hero_class_id.lower() + ".webp"
            update_values["hero_class_id"] = hero_class_id
            update_values["hero_avatar_url"] = f"/assets/images/classes/{filename}"

        user_stmt = select(User).where(User.id == user_uuid)
        user_result = await db_session.execute(user_stmt)
        user = user_result.scalar_one_or_none()

        if user:
            existing_profile = user.hero_profile or {}
            merged_profile = merge_hero_profile(existing_profile, quest_report)
            update_values["hero_profile"] = merged_profile

        await db_session.execute(
            update(User).where(User.id == user_uuid).values(**update_values)
        )

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

        interactions = questionnaire_session.state.get("interactions", [])

        new_quest = UserQuest(
            user_id=user_uuid,
            quest_type=quest_id,
            interactions=interactions,
            quest_report=db_report,
            hero_chronicle=hero_chronicle,
            completed_at=func.now(),
        )
        db_session.add(new_quest)

        await db_session.commit()

        await CacheService.invalidate_user_profile(user_id)

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

    return {"event": "final_result", "data": quest_report}
