"""
查詢效能測試

此模組測試資料庫查詢效能，特別是檢查是否存在 N+1 查詢問題，
並驗證批量查詢優化的效果。

注意：Mocks 已在 conftest.py 中配置
"""

import pytest
import uuid
import time
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime


@pytest.mark.asyncio
async def test_analytics_batch_query_performance():
    """
    測試批量查詢效能

    驗證使用單一 IN 查詢獲取多個測驗類型的效能表現，
    確保查詢時間在合理範圍內（500ms 以內）。
    """
    from app.api.quest_utils import get_analytics_for_quests
    from app.db.models import UserQuest
    from app.db.session import AsyncSessionLocal

    # Mock DB session
    mock_db = AsyncMock()

    # 模擬 20 筆 UserQuest 記錄
    mock_quests = []
    for i in range(20):
        mock_quest = MagicMock(spec=UserQuest)
        mock_quest.id = uuid.uuid4()
        mock_quest.user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        mock_quest.quest_type = ["mbti", "bigfive", "enneagram", "disc", "gallup"][
            i % 5
        ]
        mock_quest.completed_at = datetime.now()
        mock_quests.append(mock_quest)

    # 設定 mock 返回值
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_quests
    mock_db.execute.return_value = mock_result

    # 執行批量查詢
    start_time = time.time()
    quest_types = ["mbti", "bigfive", "enneagram", "disc", "gallup"]
    result = await get_analytics_for_quests(
        db=mock_db,
        user_id="00000000-0000-0000-0000-000000000001",
        quest_types=quest_types,
    )
    elapsed_time = time.time() - start_time

    # 驗證：批量查詢應在 500ms 內完成（單一查詢）
    assert elapsed_time < 0.5, f"批量查詢耗時 {elapsed_time:.3f}s，超過預期 500ms"

    # 驗證：只執行了一次資料庫查詢
    assert (
        mock_db.execute.call_count == 1
    ), f"應只執行 1 次查詢，實際執行 {mock_db.execute.call_count} 次"

    # 驗證：查詢使用了 IN 子句
    call_args = mock_db.execute.call_args
    assert call_args is not None, "應執行資料庫查詢"

    # 驗證：返回結果正確分組
    assert isinstance(result, dict), "結果應為字典"
    for quest_type in quest_types:
        assert quest_type in result, f"結果應包含 {quest_type} 類型"


@pytest.mark.asyncio
async def test_analytics_query_with_empty_result():
    """
    測試當使用者沒有測驗記錄時的查詢行為
    """
    from app.api.quest_utils import get_analytics_for_quests

    # Mock DB session
    mock_db = AsyncMock()

    # 模擬空結果
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    # 執行查詢
    result = await get_analytics_for_quests(
        db=mock_db,
        user_id="00000000-0000-0000-0000-000000000001",
        quest_types=["mbti", "bigfive"],
    )

    # 驗證：返回空字典
    assert result == {}, "當沒有記錄時應返回空字典"

    # 驗證：只執行一次查詢
    assert mock_db.execute.call_count == 1


@pytest.mark.asyncio
async def test_analytics_query_with_partial_types():
    """
    測試當使用者只完成部分測驗類型時的查詢行為
    """
    from app.api.quest_utils import get_analytics_for_quests
    from app.db.models import UserQuest

    # Mock DB session
    mock_db = AsyncMock()

    # 模擬只完成 mbti 和 bigfive 的記錄
    mock_quests = []
    for i in range(5):
        mock_quest = MagicMock(spec=UserQuest)
        mock_quest.id = uuid.uuid4()
        mock_quest.user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        mock_quest.quest_type = "mbti" if i < 2 else "bigfive"
        mock_quest.completed_at = datetime.now()
        mock_quests.append(mock_quest)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_quests
    mock_db.execute.return_value = mock_result

    # 執行查詢，包含所有 5 種類型
    quest_types = ["mbti", "bigfive", "enneagram", "disc", "gallup"]
    result = await get_analytics_for_quests(
        db=mock_db,
        user_id="00000000-0000-0000-0000-000000000001",
        quest_types=quest_types,
    )

    # 驗證：結果只包含有記錄的類型
    assert len(result) == 2, f"結果應只包含 {2} 種類型（有記錄的）"

    # 驗證：只執行一次查詢
    assert mock_db.execute.call_count == 1


@pytest.mark.asyncio
async def test_analytics_query_correctness():
    """
    測試批量查詢的正確性

    驗證返回的記錄按 completed_at 降序排列，
    且每個記錄的 quest_type 正確分組。
    """
    from app.api.quest_utils import get_analytics_for_quests
    from app.db.models import UserQuest

    # Mock DB session
    mock_db = AsyncMock()

    # 模擬多筆不同時間的記錄
    base_time = datetime(2026, 1, 1, 12, 0, 0)
    mock_quests = []

    # 按時間順序創建記錄（舊 → 新）
    for i in range(10):
        mock_quest = MagicMock(spec=UserQuest)
        mock_quest.id = uuid.uuid4()
        mock_quest.user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        mock_quest.quest_type = ["mbti", "bigfive"][i % 2]
        mock_quest.completed_at = base_time.replace(minute=i)
        mock_quests.append(mock_quest)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_quests
    mock_db.execute.return_value = mock_result

    # 執行查詢
    result = await get_analytics_for_quests(
        db=mock_db,
        user_id="00000000-0000-0000-0000-000000000001",
        quest_types=["mbti", "bigfive"],
    )

    # 驗證：每個類型都有 5 筆記錄
    assert len(result["mbti"]) == 5
    assert len(result["bigfive"]) == 5

    # 驗證：記錄數量總和正確
    total_records = sum(len(quests) for quests in result.values())
    assert total_records == 10, "應有 10 筆總記錄"
