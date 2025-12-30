import logging
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from sqlalchemy import select
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.db.models import GameDefinition

logger = logging.getLogger("app")

VALIDATOR_INSTRUCTION = """你是系統的最後防線「守望者」。你的任務不是創作，而是「校對」。

校對流程：
1. **ID 驗證**：使用 `verify_ids` 工具驗證所有待校對的 ID（`race_id`, `class_id`, `stance_id`, `talent_ids`）。
2. **邏輯連貫性**：檢查是否有明顯矛盾。例如：選中霸龍族（火屬性/侵略），但描述卻是「愛好和平的吟遊詩人」。
3. **格式完整性**：確保 `final_report` 包含所有必需的欄位（stats, destiny_guide, destiny_bonds）。
4. **輸出規範**：驗證完成後，調用 `submit_validation` 工具提交結果。

校對規範：
- 使用 `verify_ids` 工具查詢資料庫，確認 ID 是否合法。**嚴禁憑記憶或猜測判斷 ID 合法性。**
- 按類別分批查詢：race（種族）、class（職業）、stance（戰姿）、talent（天賦）。

結果判定：
- 如果 `verify_ids` 返回的所有 ID 都有效且無嚴重邏輯錯誤，`status` 設為 "SUCCESS"。
- 如果發現任何非法 ID 或嚴重邏輯錯誤，`status` 設為 "FAIL"，並列出具體的錯誤原因。
"""


async def verify_ids(
    category: str,
    id_values: list[str],
    tool_context: ToolContext = None
) -> dict:
    """
    驗證給定的 ID 列表是否存在於 game_definitions 資料表中。
    
    Args:
        category: ID 類別 ("race", "class", "stance", "talent")
        id_values: 要驗證的 ID 列表
    
    Returns:
        {"valid_ids": [...], "invalid_ids": [...]}
    """
    if not id_values:
        return {"valid_ids": [], "invalid_ids": []}
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(GameDefinition.id)
            .where(GameDefinition.category == category)
            .where(GameDefinition.id.in_(id_values))
        )
        existing_ids = {row[0] for row in result.fetchall()}
    
    valid_ids = [id_val for id_val in id_values if id_val in existing_ids]
    invalid_ids = [id_val for id_val in id_values if id_val not in existing_ids]
    
    logger.info(f"🔍 verify_ids({category}): valid={valid_ids}, invalid={invalid_ids}")
    
    return {
        "valid_ids": valid_ids,
        "invalid_ids": invalid_ids
    }


def submit_validation(
    status: str,
    errors: list[str] = None,
    tool_context: ToolContext = None
) -> dict:
    """
    提交驗證結果。
    
    Args:
        status: "SUCCESS" 或 "FAIL"。
        errors: 錯誤訊息列表（僅在 status 為 FAIL 時提供）。
        tool_context: 工具上下文。
    """
    result = {
        "status": status,
        "errors": errors or []
    }
    
    tool_context.state["validation_output"] = result
    
    if status == "SUCCESS":
        logger.info("✅ Validation Passed")
    else:
        logger.warning(f"❌ Validation Failed: {errors}")
        
    return result


def create_validator_agent() -> Agent:
    return Agent(
        name="validator_agent",
        description="Sentinel - Verify IDs against database and ensure data integrity",
        instruction=VALIDATOR_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[verify_ids, submit_validation]
    )


validator_agent = create_validator_agent()
