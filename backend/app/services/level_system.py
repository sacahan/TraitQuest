import logging

logger = logging.getLogger("app")

class LevelSystemService:
    """
    等級系統服務 - 累計制經驗值

    採用標準 RPG 累計制：EXP 持續累加，等級根據總 EXP 判定。
    等級門檻公式：Lv.N 門檻 = 100 × N × (N + 1) / 2

    | 等級 | 累計門檻 | 該級所需 |
    |------|----------|----------|
    | Lv.1 | 100      | 100      |
    | Lv.2 | 300      | 200      |
    | Lv.3 | 600      | 300      |
    | Lv.11| 6,600    | 1,100    |
    """

    @staticmethod
    def get_exp_threshold(level: int) -> int:
        """
        計算升到指定等級所需的累計 EXP 門檻。

        公式：100 × level × (level + 1) / 2

        例如：
        - Lv.1 門檻 = 100 × 1 × 2 / 2 = 100
        - Lv.2 門檻 = 100 × 2 × 3 / 2 = 300
        - Lv.3 門檻 = 100 × 3 × 4 / 2 = 600
        """
        return int(100 * level * (level + 1) / 2)

    @staticmethod
    def get_level_from_exp(total_exp: int) -> int:
        """
        根據累計 EXP 計算當前等級。

        等級 = 滿足 threshold(L) <= total_exp 的最大 L
        """
        level = 1
        while LevelSystemService.get_exp_threshold(level) <= total_exp:
            level += 1
        return level

    @staticmethod
    def calculate_exp(quality_score: float) -> int:
        """
        計算單題獲得的 EXP（保留以相容過去邏輯，後續可移除）。
        公式：10 × 分析品質加成 (1.2~2.0)
        """
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
    def check_level_up(current_level: int, new_total_exp: int) -> tuple[int, int, bool]:
        """
        檢查升級狀態（累計制）。

        與舊版差異：
        - 舊版：扣減 EXP，回傳剩餘值
        - 新版：不扣減，回傳累計總值

        回傳：(new_level, total_exp, is_leveled_up)
        - new_level: 根據累計 EXP 計算的新等級
        - total_exp: 傳入的累計 EXP（不變）
        - is_leveled_up: 是否比 current_level 更高
        """
        new_level = LevelSystemService.get_level_from_exp(new_total_exp)
        is_leveled_up = new_level > current_level

        return new_level, new_total_exp, is_leveled_up

    @staticmethod
    def get_level_progress(total_exp: int) -> dict:
        """
        計算當前等級的進度資訊。

        回傳：
        - current_threshold: 當前等級門檻
        - next_threshold: 下一等級門檻
        - progress: 進度百分比 (0.0 ~ 1.0)
        """
        level = LevelSystemService.get_level_from_exp(total_exp)

        if level == 1:
            current_threshold = 0
        else:
            current_threshold = LevelSystemService.get_exp_threshold(level - 1)

        next_threshold = LevelSystemService.get_exp_threshold(level)

        # 計算當前等級內的進度
        exp_in_level = total_exp - current_threshold
        exp_needed = next_threshold - current_threshold
        progress = exp_in_level / exp_needed if exp_needed > 0 else 0

        return {
            "current_threshold": current_threshold,
            "next_threshold": next_threshold,
            "progress": min(progress, 1.0),
        }

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


# 輔助函數，供其他模組使用
def get_exp_for_level(level: int) -> int:
    """
    獲取指定等級的累計 EXP 門檻。

    Args:
        level: 目標等級

    Returns:
        該等級所需的累計經驗值
    """
    return level_service.get_exp_threshold(level)


def calculate_level_from_exp(total_exp: int) -> int:
    """
    根據累計 EXP 計算當前等級。

    Args:
        total_exp: 累計總經驗值

    Returns:
        當前等級
    """
    return level_service.get_level_from_exp(total_exp)
