from app.services.level_system import level_service


def calculate_quest_progress(
    current_question: int, total_questions: int, level: int
) -> dict:
    """
    計算測驗進度

    Args:
        current_question: 當前題號（從 1 開始）
        total_questions: 總題數
        level: 玩家等級

    Returns:
        dict: 包含 current, total, percent 的進度資訊
    """
    question_count = level_service.get_question_count(level)

    return {
        "current": current_question,
        "total": total_questions,
        "percent": (
            (current_question / total_questions) * 100 if total_questions > 0 else 0
        ),
    }


def validate_session_state(session_data: dict) -> bool:
    """
    驗證 session 狀態是否有效

    Args:
        session_data: Session state 字典

    Returns:
        bool: 若包含必填欄位則回傳 True
    """
    required_fields = ["user_id", "quest_id", "status"]
    return all(field in session_data for field in required_fields)
