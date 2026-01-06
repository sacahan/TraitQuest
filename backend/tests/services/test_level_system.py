import pytest
from app.services.level_system import level_service

def test_calculate_exp():
    assert level_service.calculate_exp(1.0) == 10
    assert level_service.calculate_exp(1.5) == 15
    assert level_service.calculate_exp(2.0) == 20

def test_check_level_up_no_level_up():
    lvl, exp, is_up = level_service.check_level_up(1, 50)
    assert lvl == 1
    assert exp == 50
    assert not is_up

def test_check_level_up_single_level():
    # Lv1 -> Lv2 needs 100
    lvl, exp, is_up = level_service.check_level_up(1, 120)
    assert lvl == 2
    assert exp == 20
    assert is_up

def test_check_level_up_multi_level():
    # Lv1 -> Lv2: 100
    # Lv2 -> Lv3: 200
    # Total: 300
    lvl, exp, is_up = level_service.check_level_up(1, 350)
    assert lvl == 3
    assert exp == 50
    assert is_up

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

