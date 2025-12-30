import logging

logger = logging.getLogger("app")

class LevelSystemService:
    @staticmethod
    def calculate_exp(quality_score: float) -> int:
        """
        計算單題獲得的 EXP。
        公式：10 × 分析品質加成 (1.2~2.0)
        """
        # 基礎點數 10
        base_exp = 10
        total_exp = round(base_exp * quality_score)
        return total_exp

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
            5: {"unlock": "第二測驗區域", "message": "你已證明了自己的潛力，新的試煉之地已對你敞開。"},
            11: {"unlock": "靈魂對話模式", "message": "你的靈魂已足夠強大，現在你可以用自己的語言與艾比交談了。"},
            20: {"unlock": "進階測驗題數", "message": "深邃的試煉等待著你，準備好迎接更長的冒險了嗎？"}
        }
        return milestones.get(level)

level_service = LevelSystemService()
