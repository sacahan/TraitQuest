"""
心理測評計算工具
"""

from typing import Dict, List, Any
import logging

logger = logging.getLogger("app")


class PsychologicalCalculator:
    """
    負責心理測評數據的聚合與轉換
    符合開發憲章第三條：遊戲化映射系統相關邏輯
    """

    def aggregate_traits(
        self, analytics_list: List[Dict[str, Any]], quest_type: str
    ) -> Dict[str, float]:
        """
        聚合多次回答的特徵增量，並根據品質評分加權
        """
        aggregated: Dict[str, float] = {}

        for entry in analytics_list:
            deltas = entry.get("trait_deltas", {})
            quality = entry.get("quality_score", 1.0)

            for trait, delta in deltas.items():
                weighted_delta = delta * quality
                aggregated[trait] = aggregated.get(trait, 0.0) + weighted_delta

        return aggregated

    def get_mbti_type(self, aggregated: Dict[str, float]) -> str:
        """
        根據聚合特徵判斷最終 MBTI 類型
        """
        pairs = [("E", "I"), ("S", "N"), ("T", "F"), ("J", "P")]

        mbti = ""
        for p1, p2 in pairs:
            val1 = aggregated.get(p1, 0.0)
            val2 = aggregated.get(p2, 0.0)
            mbti += p1 if val1 >= val2 else p2

        return mbti

    def map_bigfive_to_stats(self, aggregated: Dict[str, float]) -> Dict[str, int]:
        """
        將 Big Five 聚合值映射到英雄基礎屬性 (STA_O, STA_C, etc.)
        符合 schemas.py 定義
        """
        mapping = {
            "Openness": "STA_O",
            "Conscientiousness": "STA_C",
            "Extraversion": "STA_E",
            "Agreeableness": "STA_A",
            "Neuroticism": "STA_N",
        }

        stats = {}
        base_value = 50

        for b5_key, stat_key in mapping.items():
            delta = aggregated.get(b5_key, 0.0)
            value = int(base_value + delta * 10)
            stats[stat_key] = max(0, min(100, value))

        return stats

    def map_enneagram_to_race(self, enneagram_type: str) -> str:
        """
        九型人格到種族的映射 (Type 1 -> RACE_1)
        """
        try:
            import re

            match = re.search(r"\d+", enneagram_type)
            type_num = match.group() if match else ""
            if not type_num:
                return "RACE_UNKNOWN"
            return f"RACE_{type_num}"
        except Exception:
            return "RACE_UNKNOWN"

    def map_mbti_to_class(self, mbti_type: str) -> str:
        """
        MBTI 到職業的映射 (INTJ -> CLS_INTJ)
        """
        return f"CLS_{mbti_type.upper()}"

    def map_disc_to_stance(self, disc_type: str) -> str:
        """
        DISC 到姿態的映射 (D -> STN_D)
        """
        first_char = disc_type[0].upper() if disc_type else "U"
        return f"STN_{first_char}"

    def map_gallup_to_talents(self, traits: List[str]) -> List[str]:
        """
        Gallup 天賦到傳奇技能的映射 (ACH -> TAL_ACH)
        """
        return [f"TAL_{t.upper()}" for t in traits]

    async def is_valid_asset_id(self, asset_id: str, category: str) -> bool:
        """
        驗證產出的 ID 是否存在於合法清單中
        """
        try:
            from app.services.game_assets import game_assets_service

            valid_ids_map = await game_assets_service.get_all_valid_ids()
            valid_ids = valid_ids_map.get(category, [])
            return asset_id in valid_ids
        except Exception as e:
            logger.error(f"Error validating asset ID: {e}")
            return False
