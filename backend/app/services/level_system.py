import logging

logger = logging.getLogger("app")

class LevelSystemService:
    @staticmethod
    def calculate_exp(quality_score: float) -> int:
        """
        計算單題獲得的 EXP（保留以相容過去邏輯，後續可移除）。
        公式：10 × 分析品質加成 (1.2~2.0)
        """
        # 基礎點數 10
        base_exp = 10
        total_exp = round(base_exp * quality_score)
        return total_exp

    @staticmethod
    def calculate_quest_exp(num_questions: int, avg_quality: float = 1.0) -> int:
        """
        計算單次測驗獲得的總 EXP。
        目標：5 次測驗累計約 5500 EXP，達到 Lv.11
        公式：(100 × 題數 × 品質) + 100 通關獎勵
        """
        base_per_question = 100
        completion_bonus = 150
        quality_multiplier = max(1.0, min(1.2, avg_quality))
        total = round(base_per_question * num_questions * quality_multiplier) + completion_bonus
        return total

    @staticmethod
    def get_question_count(level: int) -> int:
        """
        根據玩家等級取得測驗題目數量。
        Lv.1~15: 10 題
        Lv.16+: 15 題
        """
        if level >= 16:
            return 15
        else:
            return 10

    @staticmethod
    def get_quest_mode(level: int) -> dict:
        """
        根據玩家等級取得試煉模式。
        Lv.1~10: QUANTITATIVE (量化試煉 - 僅選擇題)
        Lv.11+: SOUL_NARRATIVE (靈魂對話 - 解鎖開放式輸入)
        """
        if level >= 11:
            return {
                "mode": "SOUL_NARRATIVE",
                "name": "靈魂對話",
                "description": "解鎖開放式文字輸入，AI 語義解析",
                "allowFreeText": True
            }
        else:
            return {
                "mode": "QUANTITATIVE",
                "name": "量化試煉", 
                "description": "五段式選擇題",
                "allowFreeText": False
            }

    @staticmethod
    def check_level_up(current_level: int, current_exp: int) -> tuple[int, int, bool]:
        """
        檢查是否升級。
        公式：升級所需 EXP = 100 × 當前等級
        回傳：(new_level, remaining_exp, is_leveled_up)
        """
        leveled_up = False
        new_level = current_level
        leftover_exp = current_exp
        
        while True:
            exp_needed = 100 * new_level
            if leftover_exp >= exp_needed:
                leftover_exp -= exp_needed
                new_level += 1
                leveled_up = True
            else:
                break
                
        return new_level, leftover_exp, leveled_up

    @staticmethod
    def get_level_milestone(level: int) -> dict | None:
        """
        獲取等級里程碑資訊。
        """
        milestones = {
            11: {"unlock": "靈魂對話模式", "message": "你的靈魂已足夠強大，現在你可以用自己的語言與艾比交談了。"},
            16: {"unlock": "深邃試煉", "message": "你已準備好迎接更長的冒險，試煉題數增加至 15 題。"},
        }
        return milestones.get(level)

level_service = LevelSystemService()

