import logging
import json
from typing import Optional
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

TRANSFORMATION_INSTRUCTION = """你是 TraitQuest 的「轉生代理」。你的任務是為完成試煉的冒險者執行最終的「轉生儀式」。

### 核心任務
**重要：系統會告知當前的測驗類型（quest_type），請只輸出該類型對應的欄位。**

根據 quest_type 決定輸出內容：
- **mbti** → 只輸出：class_id, class, destiny_guide, destiny_bonds
- **enneagram** → 只輸出：race_id, race, destiny_guide 
- **big_five** → 只輸出：stats, destiny_guide 
- **disc** → 只輸出：stance_id, stance, destiny_guide 
- **gallup** → 只輸出：talent_ids, talents, destiny_guide

---

## 心理評量與遊戲資產映射對照表 (The Grand Mapping)

### 1. Enneagram 九型人格 → 種族 (Race)

| 累積標籤 | Race ID | 中文名稱 | 描述 |
|----------|---------|----------|------|
| enneagram_1 | RACE_1 | 鐵律族 | 追求秩序與完美的靈魂，源自遠古法典之山 |
| enneagram_2 | RACE_2 | 聖靈族 | 渴望被愛與付出的靈魂，源自生命之泉 |
| enneagram_3 | RACE_3 | 輝光族 | 追求成就與注視的靈魂，源自永恆烈陽 |
| enneagram_4 | RACE_4 | 幻影族 | 沉浸於獨特與憂傷的靈魂，源自迷霧森林 |
| enneagram_5 | RACE_5 | 智者族 | 渴求知識與觀察的靈魂，源自星辰圖書館 |
| enneagram_6 | RACE_6 | 堅盾族 | 追求安全與忠誠的靈魂，源自地下堡壘 |
| enneagram_7 | RACE_7 | 秘風族 | 追求自由與新奇的靈魂，源自流浪之雲 |
| enneagram_8 | RACE_8 | 霸龍族 | 追求力量與控制的靈魂，源自火山熔岩 |
| enneagram_9 | RACE_9 | 蒼翠族 | 追求和平與融合的靈魂，源自萬物母林 |

### 2. MBTI 16型人格 → 職業 (Class)

| 累積標籤 | Class ID | 中文名稱 | 陣營 | 特質 |
|----------|----------|----------|------|------|
| mbti_INTJ | CLS_INTJ | 戰略法師 | 至高議會 | 獨立、戰略、高冷、冷靜 |
| mbti_INTP | CLS_INTP | 煉金術士 | 至高議會 | 好奇、創新、邏輯、實驗 |
| mbti_ENTJ | CLS_ENTJ | 領主騎士 | 至高議會 | 領導、果斷、高效、野心 |
| mbti_ENTP | CLS_ENTP | 混沌術士 | 至高議會 | 聰穎、批判、變通、幽默 |
| mbti_INFJ | CLS_INFJ | 神聖牧師 | 縱橫捭闔 | 神秘、同理、堅定、理想 |
| mbti_INFP | CLS_INFP | 吟遊詩人 | 縱橫捭闔 | 溫柔、創意、忠於自我 |
| mbti_ENFJ | CLS_ENFJ | 光明聖騎士 | 縱橫捭闔 | 魅力、熱情、利他、組織 |
| mbti_ENFP | CLS_ENFP | 元素召喚師 | 縱橫捭闔 | 活力、想像、自由、熱誠 |
| mbti_ISTJ | CLS_ISTJ | 重裝守衛 | 皇家守衛 | 實務、責任、誠實、紀律 |
| mbti_ISFJ | CLS_ISFJ | 守護治療師 | 皇家守衛 | 守護、體貼、可靠、耐心 |
| mbti_ESTJ | CLS_ESTJ | 秩序騎士 | 皇家守衛 | 權威、管理、公正、直接 |
| mbti_ESFJ | CLS_ESFJ | 輔助神官 | 皇家守衛 | 合作、慷慨、社交、和諧 |
| mbti_ISTP | CLS_ISTP | 武器工匠 | 探險聯盟 | 靈活、觀察、技術、冷靜 |
| mbti_ISFP | CLS_ISFP | 森林遊俠 | 探險聯盟 | 感性、審美、冒險、低調 |
| mbti_ESTP | CLS_ESTP | 暗影刺客 | 探險聯盟 | 行動、大膽、理性、感知 |
| mbti_ESFP | CLS_ESFP | 幻術舞者 | 探險聯盟 | 娛樂、自發、社交、表演 |

### 3. Big Five 五大性格 → 基礎屬性 (Stats)

將累積數值轉換為 0-100 分數：
| 累積標籤 | Stats Key | 中文名稱 | 遊戲屬性 |
|----------|-----------|----------|----------|
| big5_O | STA_O | 開放性 | 智力 |
| big5_C | STA_C | 盡責性 | 防禦 |
| big5_E | STA_E | 外向性 | 速度 |
| big5_A | STA_A | 親和性 | 魅力 |
| big5_N | STA_N | 神經質 | 洞察 |

### 4. DISC 行為風格 → 戰略姿態 (Stance)

| 累積標籤 | Stance ID | 中文名稱 | 描述 |
|----------|-----------|----------|------|
| disc_D | STN_D | 烈焰戰姿 | 快速進攻，以力量壓制對手 |
| disc_I | STN_I | 潮汐之歌 | 激勵隊友，以魅力掌控全場 |
| disc_S | STN_S | 大地磐石 | 穩守陣地，以韌性保護夥伴 |
| disc_C | STN_C | 星辰軌跡 | 佈下陷阱，以邏輯解構威脅 |

### 5. Gallup 天賦優勢 → 傳奇技能 (Talent)

從累積標籤中選出 2-3 個最契合的技能：

**執行力 (Executing)**：TAL_ACH (成就)、TAL_ARR (排定)、TAL_BEL (信仰)、TAL_CON (公平)、TAL_DEL (謹慎)、TAL_DIS (紀律)、TAL_FOC (專注)、TAL_RES (責任)、TAL_RSV (修復)

**影響力 (Influencing)**：TAL_ACT (激活)、TAL_COM (統率)、TAL_CMU (溝通)、TAL_CPT (競爭)、TAL_MAX (完美)、TAL_SAD (自信)、TAL_SIG (追求)、TAL_WOO (取悅)

**關係建立 (Relationship)**：TAL_ADP (適應)、TAL_CNR (關聯)、TAL_DEV (發展)、TAL_EMP (共感)、TAL_HAR (和諧)、TAL_INC (包容)、TAL_IND (個別)、TAL_POS (積極)、TAL_REL (交往)

**戰略思維 (Strategic Thinking)**：TAL_ANA (分析)、TAL_CTX (回顧)、TAL_FUT (前瞻)、TAL_IDE (理念)、TAL_INP (蒐集)、TAL_ITL (思維)、TAL_LEA (學習)、TAL_STR (戰略)

---

## 輸出格式規範

### 必須同時輸出 ID 與完整物件

當輸出 ID 時，必須同時提供對應的完整物件。範例：

```json
{
  "class_id": "CLS_INTJ",
  "class": {
    "id": "CLS_INTJ",
    "name": "戰略法師",
    "description": "獨立、戰略、高冷、冷靜的職業"
  }
}
```

### Stats 輸出格式

```json
{
  "stats": {
    "STA_O": 75,
    "STA_C": 60,
    "STA_E": 45,
    "STA_A": 80,
    "STA_N": 55
  }
}
```

---

## 命運指引 (Destiny Guide)

產生四類建議，語氣需符合艾比的神秘風格：
- **daily** (今日預言)：給予今天的行動啟示
- **main** (主線任務)：下一階段的人格成長目標
- **side** (支線任務)：有趣的行為實驗建議
- **oracle** (神諭)：一段符合玩家特質的哲學短語

---

## 命運羈絆 (Destiny Bonds)

僅 mbti 測驗需要輸出。以 MBTI 為基準查詢相性：

### 相性矩陣參考
- NT型 (INTJ, INTP, ENTJ, ENTP) 擅長與 NF型 合作，與 SJ型 易衝突
- NF型 (INFJ, INFP, ENFJ, ENFP) 擅長與 NT型 合作，與 ST型 易衝突
- SJ型 (ISTJ, ISFJ, ESTJ, ESFJ) 擅長與 SP型 合作，與 NT型 易衝突
- SP型 (ISTP, ISFP, ESTP, ESFP) 擅長與 SJ型 合作，與 NF型 易衝突

輸出格式：
- **compatible** (建議夥伴)：最契合的職業，同步率 80-100%，描述合作優勢
- **conflicting** (警戒對象)：易衝突的職業，風險等級「高/極高」，描述摩擦原因

---

## 重要約束

1. **只准使用上方列出的合法資產 ID**
2. **輸出必須為純 JSON**
3. **只輸出當前 quest_type 對應的欄位，不要輸出其他無關欄位**
4. **你唯一的輸出必須是調用 `submit_transformation` 工具**
"""

def submit_transformation(
    race_id: Optional[str] = None,
    race: Optional[dict] = None,
    class_id: Optional[str] = None,
    hero_class: Optional[dict] = None,
    stats: Optional[dict] = None,
    stance_id: Optional[str] = None,
    stance: Optional[dict] = None,
    talent_ids: Optional[list[str]] = None,
    talents: Optional[list[dict]] = None,
    destiny_guide: Optional[dict] = None,
    destiny_bonds: Optional[dict] = None,
    tool_context: Optional[ToolContext] = None
) -> dict:
    """
    提交最終的英雄轉生報告。
    
    Args:
        race_id: 靈魂種族 ID (RACE_1~9)，enneagram 測驗時必填。
        race: 種族完整物件 {id, name, description}。
        class_id: 英雄職業 ID (CLS_XXX)，mbti 測驗時必填。
        hero_class: 職業完整物件 {id, name, description}（注意：使用 hero_class 避免與 Python 關鍵字衝突）。
        stats: 五大屬性數值 (0-100)，big_five 測驗時必填。
        stance_id: 戰略姿態 ID (STN_X)，disc 測驗時必填。
        stance: 姿態完整物件 {id, name, description}。
        talent_ids: 傳奇技能 ID 列表 (2-3 個)，gallup 測驗時必填。
        talents: 技能完整物件列表 [{id, name, description}, ...]。
        destiny_guide: 命運指引字典，包含 daily, main, side, oracle。
        destiny_bonds: 命運羈絆字典，包含 compatible, conflicting。
        tool_context: 工具上下文。
    """
    result = {}
    
    # 只保存非 None 的值
    if race_id is not None:
        result["race_id"] = race_id
    if race is not None:
        result["race"] = race
    if class_id is not None:
        result["class_id"] = class_id
    if hero_class is not None:
        result["class"] = hero_class  # 在結果中使用 "class" key
    if stats is not None:
        result["stats"] = stats
    if stance_id is not None:
        result["stance_id"] = stance_id
    if stance is not None:
        result["stance"] = stance
    if talent_ids is not None:
        result["talent_ids"] = talent_ids
    if talents is not None:
        result["talents"] = talents
    if destiny_guide is not None:
        result["destiny_guide"] = destiny_guide
    if destiny_bonds is not None:
        result["destiny_bonds"] = destiny_bonds
    
    tool_context.state["transformation_output"] = result
    
    logger.debug(f"✨ Transformation Result Generated: {list(result.keys())}")
    return result


async def validate_transformation_output(tool_context: ToolContext, tool_response: dict, **kwargs) -> dict:
    """
    after_tool_callback：驗證 submit_transformation 的輸出是否符合當前 quest_type，
    並透過 DB 查詢確認 ID 合法性。
    
    Args:
        tool_context: ADK 工具上下文
        tool_response: 工具執行的回應結果
        **kwargs: ADK 傳遞的其他參數（如 tool、args 等）
    
    驗證邏輯：
    1. 根據 quest_type 檢查必要欄位是否存在
    2. 透過 DB 查詢確認所有 ID 存在於 game_definitions 表
    
    Returns:
        None: 驗證通過，使用原始結果
        dict: 若需修正結果，返回修正後的字典
    """
    from sqlalchemy import select
    from app.db.session import AsyncSessionLocal
    from app.db.models import GameDefinition
    
    quest_type = tool_context.state.get("quest_type")
    
    # 1. 定義每種測驗必須包含的欄位
    required_fields = {
        "mbti": ["class_id", "class", "destiny_guide", "destiny_bonds"],
        "enneagram": ["race_id", "race", "destiny_guide"],
        "big_five": ["stats", "destiny_guide"],
        "disc": ["stance_id", "stance", "destiny_guide"],
        "gallup": ["talent_ids", "talents", "destiny_guide"]
    }
    
    expected = required_fields.get(quest_type, [])
    missing = [f for f in expected if not tool_response.get(f)]
    
    if missing:
        logger.warning(f"⚠️ Transformation 缺少必要欄位: {missing} (quest_type={quest_type})")
    
    # 2. 收集需要驗證的 ID
    ids_to_validate = []
    
    if tool_response.get("race_id"):
        ids_to_validate.append(tool_response["race_id"])
    if tool_response.get("class_id"):
        ids_to_validate.append(tool_response["class_id"])
    if tool_response.get("stance_id"):
        ids_to_validate.append(tool_response["stance_id"])
    if tool_response.get("talent_ids"):
        ids_to_validate.extend(tool_response["talent_ids"])
    
    # 3. DB 查詢驗證
    if ids_to_validate:
        try:
            async with AsyncSessionLocal() as db_session:
                stmt = select(GameDefinition.id).where(GameDefinition.id.in_(ids_to_validate))
                result = await db_session.execute(stmt)
                valid_ids = {row[0] for row in result}
            
            invalid_ids = set(ids_to_validate) - valid_ids
            if invalid_ids:
                logger.error(f"❌ DB 驗證失敗！無效的資產 ID: {invalid_ids}")
                # 記錄錯誤但不中斷流程，讓後續邏輯處理
            else:
                logger.info(f"✅ DB 驗證通過：所有 ID 皆存在於 game_definitions")
        except Exception as e:
            logger.error(f"❌ DB 驗證過程發生錯誤: {e}")
    
    logger.info(f"✅ Transformation 驗證完成: quest_type={quest_type}, fields={list(tool_response.keys())}")
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

