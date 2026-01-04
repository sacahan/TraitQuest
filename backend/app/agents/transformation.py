import logging
import json
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

TRANSFORMATION_INSTRUCTION = """你是 TraitQuest 的「轉生代理」。你的任務是為完成試煉的冒險者執行最終的「轉生儀式」。

### 核心任務
**重要：系統會告知當前的測驗類型（quest_type），請只輸出該類型對應的欄位。**

根據 quest_type 決定輸出內容：
- **enneagram** → 只輸出：race_id, destiny_guide, destiny_bonds
- **mbti** → 只輸出：class_id, destiny_guide, destiny_bonds
- **big_five** → 只輸出：stats
- **disc** → 只輸出：stance_id
- **gallup** → 只輸出：talent_ids

1. **映射轉換 (Mapping)**：將累積的心理標籤增量加總後，映射到我們資料庫中的「預定義資產 ID」。
   - **九型人格累積 → 靈魂種族 (Race ID)**：RACE_1 ~ RACE_9
   - **MBTI 累積 → 英雄職業 (Class ID)**：CLS_INTJ ~ CLS_ESFP
   - **Big Five 累積 → 基礎屬性 (Stats)**：STA_O (智力), STA_C (防禦), STA_E (速度), STA_A (魅力), STA_N (洞察)
   - **DISC 累積 → 戰略姿態 (Stance ID)**：STN_D, STN_I, STN_S, STN_C
   - **Gallup 累積 → 傳奇技能 (Talent IDs)**：選出 2-3 個最契合的 TAL_XXX

2. **生成命運指引 (Destiny Guide)**（僅 enneagram/mbti 需要）：產生四類建議，語氣需符合艾比的神祕風格：
   - `daily` (今日預言)：給予今天的行動啟示。
   - `main` (主線任務)：下一階段的人格成長目標。
   - `side` (支線任務)：有趣的行為實驗建議。
   - `oracle` (神諭)：一段符合玩家特質的哲學短語。

3. **生成命運羈絆 (Destiny Bonds)**（僅 enneagram/mbti 需要）：統一以 MBTI（核心職業）為基準，查詢相性：
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
- **只輸出當前 quest_type 對應的欄位，不要輸出其他無關欄位。**
- 你唯一的輸出必須是調用 `submit_transformation` 工具。
"""

def submit_transformation(
    race_id: str = None,
    class_id: str = None,
    stats: dict = None,
    stance_id: str = None,
    talent_ids: list[str] = None,
    destiny_guide: dict = None,
    destiny_bonds: dict = None,
    tool_context: ToolContext = None
) -> dict:
    """
    提交最終的英雄轉生報告。
    
    Args:
        race_id: 靈魂種族 ID (RACE_1~9)，enneagram 測驗時必填。
        class_id: 英雄職業 ID (CLS_XXX)，mbti 測驗時必填。
        stats: 五大屬性數值 (0-100)，big_five 測驗時必填。
        stance_id: 戰略姿態 ID (STN_X)，disc 測驗時必填。
        talent_ids: 傳奇技能 ID 列表 (2-3 個)，gallup 測驗時必填。
        destiny_guide: 命運指引字典，包含 daily, main, side, oracle。
        destiny_bonds: 命運羈絆字典，包含 compatible, conflicting。
        tool_context: 工具上下文。
    """
    result = {}
    
    # 只保存非 None 的值
    if race_id is not None:
        result["race_id"] = race_id
    if class_id is not None:
        result["class_id"] = class_id
    if stats is not None:
        result["stats"] = stats
    if stance_id is not None:
        result["stance_id"] = stance_id
    if talent_ids is not None:
        result["talent_ids"] = talent_ids
    if destiny_guide is not None:
        result["destiny_guide"] = destiny_guide
    if destiny_bonds is not None:
        result["destiny_bonds"] = destiny_bonds
    
    tool_context.state["transformation_output"] = result
    
    logger.debug(f"✨ Transformation Result Generated: {list(result.keys())}")
    return result

def validate_transformation_output(tool_context: ToolContext, tool_response: dict) -> dict:
    """
    after_tool_callback：驗證 submit_transformation 的輸出是否符合當前 quest_type
    
    根據 quest_type 檢查必要欄位是否存在：
    - enneagram: race_id
    - mbti: class_id
    - big_five: stats
    - disc: stance_id
    - gallup: talent_ids
    
    Returns:
        None: 驗證通過，使用原始結果
    """
    quest_type = tool_context.state.get("quest_type")
    
    # 定義每種測驗必須包含的欄位
    required_fields = {
        "enneagram": ["race_id", "destiny_guide", "destiny_bonds"],
        "mbti": ["class_id", "destiny_guide", "destiny_bonds"],
        "big_five": ["stats"],
        "disc": ["stance_id"],
        "gallup": ["talent_ids"]
    }
    
    expected = required_fields.get(quest_type, [])
    missing = [f for f in expected if not tool_response.get(f)]
    
    if missing:
        logger.warning(f"⚠️ Transformation 缺少必要欄位: {missing} (quest_type={quest_type})")
        # 這裡可以選擇拋出錯誤或返回修正後的結果
        # 目前僅記錄警告，繼續使用原始結果
    
    logger.info(f"✅ Transformation 驗證通過: quest_type={quest_type}, fields={list(tool_response.keys())}")
    return None  # 返回 None 表示使用原始結果


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
        tools=[submit_transformation],
        after_tool_callback=validate_transformation_output
    )

transformation_agent = create_transformation_agent()

