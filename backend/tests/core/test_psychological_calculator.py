"""
心理測評計分聚合器測試 (Updated Stage)
"""

import pytest
from app.core.calculators import PsychologicalCalculator


def test_aggregate_bigfive_traits():
    """測試 Big Five 特徵值的聚合"""
    calculator = PsychologicalCalculator()
    analytics_list = [
        {"trait_deltas": {"Openness": 0.5, "Extraversion": 0.2}, "quality_score": 1.5},
        {"trait_deltas": {"Openness": 0.3, "Extraversion": -0.1}, "quality_score": 1.0},
    ]
    result = calculator.aggregate_traits(analytics_list, "bigfive")
    assert result["Openness"] == pytest.approx(1.05)
    assert result["Extraversion"] == pytest.approx(0.2)


def test_bigfive_to_stats_mapping():
    """測試 Big Five 分數到英雄屬性的轉換 (使用 STA_ 前綴)"""
    calculator = PsychologicalCalculator()
    aggregated = {
        "Openness": 1.5,
        "Conscientiousness": 0.8,
        "Extraversion": -0.5,
        "Agreeableness": 1.0,
        "Neuroticism": -1.2,
    }
    stats = calculator.map_bigfive_to_stats(aggregated)
    # 預期：50 + 1.5 * 10 = 65
    assert stats["STA_O"] == 65
    assert stats["STA_C"] == 58
    assert stats["STA_E"] == 45
    assert stats["STA_A"] == 60
    assert stats["STA_N"] == 38
