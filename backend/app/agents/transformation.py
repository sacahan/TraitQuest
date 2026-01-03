import logging
import json
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

TRANSFORMATION_INSTRUCTION = """你是 TraitQuest 的「轉生代理」。你的任務是為完成試煉的冒險者執行最終的「轉生儀式」。

### 核心任務
1. **映射轉換 (Mapping)**：將累積的心理標籤增量加總後，映射到我們資料庫中的「預定義資產 ID」。
   - **九型人格累積 → 靈魂種族 (Race ID)**：RACE_1 ~ RACE_9
   - **MBTI 累積 → 英雄職業 (Class ID)**：CLS_INTJ ~ CLS_ESFP
   - **Big Five 累積 → 基礎屬性 (Stats)**：STA_IN (智力), STA_DE (防禦), STA_SP (速度), STA_CH (魅力), STA_IN (洞察 - 注意 ID 是 STA_IN 與智力相同)
   - **DISC 累積 → 戰略姿態 (Stance ID)**：STN_D, STN_I, STN_S, STN_C
   - **Gallup 累積 → 傳奇技能 (Talent IDs)**：選出 2-3 個最契合的 TAL_XXX

2. **生成命運指引 (Destiny Guide)**：產生四類建議，語氣需符合艾比的神祕風格：
   - `daily` (今日預言)：給予今天的行動啟示。
   - `main` (主線任務)：下一階段的人格成長目標。
   - `side` (支線任務)：有趣的行為實驗建議。
   - `oracle` (神諭)：一段充滿深意的哲學短語。

3. **生成命運羈絆 (Destiny Bonds)**：統一以 MBTI（核心職業）為基準，查詢相性：
   - **Compatible (建議夥伴)**：最契合的職業，同步率 80-100%。描述合作優勢。
   - **Conflicting (警戒對象)**：易衝突的職業，風險等級「高/極高」。描述摩擦原因。

### 相性矩陣參考 (內部邏輯)
- NT型 (INTJ, INTP, ENTJ, ENTP) 擅長與 NF型 合作，與 SJ型 易衝突。
- NF型 (INFJ, INFP, ENFJ, ENFP) 擅長與 NT型 合作，與 ST型 易衝突。
- SJ型 (ISTJ, ISFJ, ESTJ, ESFJ) 擅長與 SP型 合作，與 NT型 易衝突。
- SP型 (ISTP, ISFP, ESTP, ESFP) 擅長與 SJ型 合作，與 NF型 易衝突。

### 重要約束
- 只准使用提供的【合法資產 ID】。
- 輸出必須為純 JSON。
- 你唯一的輸出必須是調用 `submit_transformation` 工具。
"""

def submit_transformation(
    race_id: str,
    class_id: str,
    stats: dict,
    stance_id: str,
    talent_ids: list[str],
    destiny_guide: dict,
    destiny_bonds: dict,
    tool_context: ToolContext
) -> dict:
    """
    提交最終的英雄轉生報告。
    
    Args:
        race_id: 靈魂種族 ID (RACE_1~9)。
        class_id: 英雄職業 ID (CLS_XXX)。
        stats: 五大屬性數值 (0-100)，key 為 STA_IN, STA_DE, STA_SP, STA_CH, STA_IN。
        stance_id: 戰略姿態 ID (STN_X)。
        talent_ids: 傳奇技能 ID 列表 (2-3 個)。
        destiny_guide: 命運指引字典，包含 daily, main, side, oracle。
        destiny_bonds: 命運羈絆字典，包含 compatible, conflicting。
        tool_context: 工具上下文。
    """
    result = {
        "race_id": race_id,
        "class_id": class_id,
        "stats": stats,
        "stance_id": stance_id,
        "talent_ids": talent_ids,
        "destiny_guide": destiny_guide,
        "destiny_bonds": destiny_bonds
    }
    
    tool_context.state["transformation_output"] = result
    
    logger.debug(f"✨ Transformation Result Generated for {class_id}")
    return result

def create_transformation_agent() -> Agent:
    return Agent(
        name="transformation_agent",
        description="Incarnation Agent - Map traits to game assets and generate destiny content",
        instruction=TRANSFORMATION_INSTRUCTION,
        model=LiteLlm(
            model=settings.LLM_MODEL,
            api_key=settings.GITHUB_COPILOT_TOKEN,
            extra_headers=settings.GITHUB_COPILOT_HEADERS,
        ),
        tools=[submit_transformation]
    )

transformation_agent = create_transformation_agent()

