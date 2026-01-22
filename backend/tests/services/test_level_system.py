import pytest
from app.services.level_system import level_service


def test_calculate_exp():
    assert level_service.calculate_exp(1.0) == 10
    assert level_service.calculate_exp(1.5) == 15
    assert level_service.calculate_exp(2.0) == 20


def test_get_exp_threshold():
    """測試等級門檻計算：Lv.N 門檻 = 100 × N × (N+1) / 2"""
    assert level_service.get_exp_threshold(1) == 100  # 100 × 1 × 2 / 2
    assert level_service.get_exp_threshold(2) == 300  # 100 × 2 × 3 / 2
    assert level_service.get_exp_threshold(3) == 600  # 100 × 3 × 4 / 2
    assert level_service.get_exp_threshold(10) == 5500  # 100 × 10 × 11 / 2


def test_get_level_from_exp():
    """測試根據累計 EXP 計算等級"""
    assert level_service.get_level_from_exp(0) == 1  # 0 EXP = Lv.1
    assert level_service.get_level_from_exp(99) == 1  # 99 < 100 = Lv.1
    assert level_service.get_level_from_exp(100) == 2  # 100 = 門檻，升 Lv.2
    assert level_service.get_level_from_exp(299) == 2  # 299 < 300 = Lv.2
    assert level_service.get_level_from_exp(300) == 3  # 300 = 門檻，升 Lv.3
    assert level_service.get_level_from_exp(510) == 3  # 510 < 600 = Lv.3
    assert level_service.get_level_from_exp(600) == 4  # 600 = 門檻，升 Lv.4


def test_check_level_up_no_level_up():
    """測試未達升級門檻"""
    lvl, exp, is_up = level_service.check_level_up(1, 50)
    assert lvl == 1
    assert exp == 50  # 累計制：回傳原值
    assert not is_up


def test_check_level_up_cumulative():
    """測試累計制升級判定"""
    # 從 Lv.1 獲得 510 EXP
    lvl, exp, is_up = level_service.check_level_up(1, 510)
    assert lvl == 3  # 510 >= 300 (Lv.2 門檻)，510 < 600 (Lv.3 門檻)
    assert exp == 510  # 累計制：不消耗 EXP
    assert is_up


def test_check_level_up_exact_threshold():
    """測試剛好達到門檻"""
    lvl, exp, is_up = level_service.check_level_up(1, 100)
    assert lvl == 2
    assert exp == 100
    assert is_up


def test_get_level_progress():
    """測試等級進度計算"""
    # 0 EXP: Lv.1, 進度 0%
    progress = level_service.get_level_progress(0)
    assert progress["current_threshold"] == 0
    assert progress["next_threshold"] == 100
    assert progress["progress"] == 0.0

    # 50 EXP: Lv.1, 進度 50%
    progress = level_service.get_level_progress(50)
    assert progress["progress"] == 0.5

    # 200 EXP: Lv.2, 進度 (200-100)/(300-100) = 50%
    progress = level_service.get_level_progress(200)
    assert progress["current_threshold"] == 100
    assert progress["next_threshold"] == 300
    assert progress["progress"] == 0.5


def test_get_question_count():
    assert level_service.get_question_count(1) == 10
    assert level_service.get_question_count(10) == 10
    assert level_service.get_question_count(15) == 10
    assert level_service.get_question_count(16) == 15
    assert level_service.get_question_count(20) == 15


def test_get_level_milestone():
    assert level_service.get_level_milestone(10) is None
    assert level_service.get_level_milestone(11)["unlock"] == "靈魂對話模式"
    assert level_service.get_level_milestone(16)["unlock"] == "深邃試煉"
    assert level_service.get_level_milestone(20) is None


def test_get_quest_mode():
    mode_lv1 = level_service.get_quest_mode(1)
    assert mode_lv1["mode"] == "QUANTITATIVE"
    assert not mode_lv1["allowFreeText"]

    mode_lv11 = level_service.get_quest_mode(11)
    assert mode_lv11["mode"] == "SOUL_NARRATIVE"
    assert mode_lv11["allowFreeText"]


@pytest.mark.asyncio
async def test_get_level_from_exp_boundaries():
    """測試邊界情況"""
    assert level_service.get_level_from_exp(0) == 1
    assert level_service.get_level_from_exp(50) == 1
    assert level_service.get_level_from_exp(100) == 2

    assert level_service.get_level_from_exp(101) == 2
    assert level_service.get_level_from_exp(210) == 2
    assert level_service.get_level_from_exp(300) == 3

    assert level_service.get_level_from_exp(-100) == 1
