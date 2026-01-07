import logging
import json
from typing import Optional
from app.core.agent import TraitQuestAgent as Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext
from app.core.config import settings

logger = logging.getLogger("app")

TRANSFORMATION_INSTRUCTION = """你是 TraitQuest 的「轉生代理」，負責將心理測評結果映射為遊戲資產。

## 🎯 輸出規則

**根據 quest_type 輸出對應欄位（所有類型都必須輸出 destiny_guide 與 destiny_bonds）**：

| quest_type | 必須輸出的欄位 |
|-----------|------------|
| mbti      | class_id, class_name, destiny_guide, destiny_bonds |
| enneagram | race_id, race_name, destiny_guide, destiny_bonds |
| bigfive   | stats, destiny_guide, destiny_bonds |
| disc      | stance_id, stance_name, destiny_guide, destiny_bonds |
| gallup    | talent_ids, talent_names, destiny_guide, destiny_bonds |

---

## 📊 映射對照表

### MBTI → 職業 (Class)
| ID | 特質 | 稱號 |
|----|------|------|
| CLS_INTJ | 獨立、戰略、高冷、冷靜 | 戰略法師 |
| CLS_INTP | 好奇、創新、邏輯、實驗 | 煉金術士 |
| CLS_ENTJ | 領導、果斷、高效、野心 | 領主騎士 |
| CLS_ENTP | 聰穎、批判、變通、幽默 | 混沌術士 |
| CLS_INFJ | 神秘、同理、堅定、理想 | 神聖牧師 |
| CLS_INFP | 溫柔、創意、忠於自我 | 吟遊詩人 |
| CLS_ENFJ | 魅力、熱情、利他、組織 | 光明聖騎士 |
| CLS_ENFP | 活力、想像、自由、熱誠 | 元素召喚師 |
| CLS_ISTJ | 實務、責任、誠實、紀律 | 重裝守衛 |
| CLS_ISFJ | 守護、體貼、可靠、耐心 | 守護治療師 |
| CLS_ESTJ | 權威、管理、公正、直接 | 秩序騎士 |
| CLS_ESFJ | 合作、慷慨、社交、和諧 | 輔助神官 |
| CLS_ISTP | 靈活、觀察、技術、冷靜 | 武器工匠 |
| CLS_ISFP | 感性、審美、冒險、低調 | 森林遊俠 |
| CLS_ESTP | 行動、大膽、理性、感知 | 暗影刺客 |
| CLS_ESFP | 娛樂、自發、社交、表演 | 幻術舞者 |

### Enneagram → 種族 (Race)
| ID | 性格 | 特性 |族名|
|----|------|------|------|
| RACE_1 | The Perfectionist | 追求秩序與完美的靈魂，源自遠古法典之山 | 鐵律族 |
| RACE_2 | The Helper | 渴望被愛與付出的靈魂，源自生命之泉 | 聖靈族 |
| RACE_3 | The Achiever | 追求成就與注視的靈魂，源自永恆烈陽 | 輝光族 |
| RACE_4 | The Romantic | 沉浸於獨特與憂傷的靈魂，源自迷霧森林 | 幻影族 |
| RACE_5 | The Observer | 渴求知識與觀察的靈魂，源自星辰圖書館 | 智者族 |
| RACE_6 | The Loyalist | 追求安全與忠誠的靈魂，源自地下堡壘 | 堅盾族 |
| RACE_7 | The Epicure | 追求自由與新奇的靈魂，源自流浪之雲 | 秘風族 |
| RACE_8 | The Challenger | 追求力量與控制的靈魂，源自火山熔岩 | 霸龍族 |
| RACE_9 | The Peacemaker | 追求和平與融合的靈魂，源自萬物母林 | 蒼翠族 |

### Big Five → 屬性 (Stats)
輸出 key: STA_O, STA_C, STA_E, STA_A, STA_N 與 value: 累積數值轉換為 0-100 的字典

### DISC → 姿態 (Stance)
| ID | 名稱 | 特性 | 戰技 |
|----|------|------|
| STN_D | Dominance | 快速進攻，以力量壓制 | 烈焰戰姿 | 
| STN_I | Influence | 激勵隊友，以魅力掌控 | 潮汐之歌 |
| STN_S | Steadiness | 穩守陣地，以韌性保護 | 大地磐石 |
| STN_C | Compliance | 佈下陷阱，以邏輯解構 | 星辰軌跡 |

### Gallup → 天賦 (Talent)
選出 5 個最契合的技能，共 33 種天賦：

| ID | 名稱 | 領域 |
|----|------|------|
| TAL_ACH | 成就 | 執行力 (Executing) |
| TAL_ARR | 排定 | 執行力 (Executing) |
| TAL_BEL | 信仰 | 執行力 (Executing) |
| TAL_CON | 公平 | 執行力 (Executing) |
| TAL_DEL | 謹慎 | 執行力 (Executing) |
| TAL_DIS | 紀律 | 執行力 (Executing) |
| TAL_FOC | 專注 | 執行力 (Executing) |
| TAL_RES | 責任 | 執行力 (Executing) |
| TAL_RSV | 修復 | 執行力 (Executing) |
| TAL_ACT | 激活 | 影響力 (Influencing) |
| TAL_COM | 統率 | 影響力 (Influencing) |
| TAL_CMU | 溝通 | 影響力 (Influencing) |
| TAL_CPT | 競爭 | 影響力 (Influencing) |
| TAL_MAX | 完美 | 影響力 (Influencing) |
| TAL_SAD | 自信 | 影響力 (Influencing) |
| TAL_SIG | 追求 | 影響力 (Influencing) |
| TAL_WOO | 取悅 | 影響力 (Influencing) |
| TAL_ADP | 適應 | 關係建立 (Relationship Building) |
| TAL_CNR | 關聯 | 關係建立 (Relationship Building) |
| TAL_DEV | 發展 | 關係建立 (Relationship Building) |
| TAL_EMP | 共感 | 關係建立 (Relationship Building) |
| TAL_HAR | 和諧 | 關係建立 (Relationship Building) |
| TAL_INC | 包容 | 關係建立 (Relationship Building) |
| TAL_IND | 個別 | 關係建立 (Relationship Building) |
| TAL_POS | 積極 | 關係建立 (Relationship Building) |
| TAL_REL | 交往 | 關係建立 (Relationship Building) |
| TAL_ANA | 分析 | 戰略思維 (Strategic Thinking) |
| TAL_CTX | 回顧 | 戰略思維 (Strategic Thinking) |
| TAL_FUT | 前瞻 | 戰略思維 (Strategic Thinking) |
| TAL_IDE | 理念 | 戰略思維 (Strategic Thinking) |
| TAL_INP | 蒐集 | 戰略思維 (Strategic Thinking) |
| TAL_ITL | 思維 | 戰略思維 (Strategic Thinking) |
| TAL_LEA | 學習 | 戰略思維 (Strategic Thinking) |
| TAL_STR | 戰略 | 戰略思維 (Strategic Thinking) |

---

## 📋 完整輸出範例

### MBTI 輸出範例：
```json
{
  "class_id": "CLS_INTJ",
  "class_name": "戰略法師",
  "destiny_guide": {
    "daily": "今日宜深度思考，避免倉促決策",
    "main": "提升與他人的溝通技巧，平衡理性與感性",
    "side": "嘗試分享你的規劃給信任的朋友",
    "oracle": "孤獨的塔頂，是智者的試煉場"
  },
  "destiny_bonds": {
    "compatible": [
      {
        "class_id": "CLS_ENFP",
        "class_name": "元素召喚師",
        "description": "互補能量，激發創意與執行力"
      },
      {
        "class_id": "CLS_INFJ",
        "class_name": "神聖牧師",
        "description": "深層理解，共同追求遠大目標"
      }
    ],
    "conflicting": [
      {
        "class_id": "CLS_ESFJ",
        "class_name": "輔助神官",
        "description": "價值觀與行動方式差異過大"
      },
      {
        "class_id": "CLS_ESTP",
        "class_name": "暗影刺客",
        "description": "計劃性與即興性的劇烈衝突"
      }
    ]
  }
}
```

### Big Five 輸出範例：
```json
{
  "stats": {
    "STA_O": 75,
    "STA_C": 60,
    "STA_E": 45,
    "STA_A": 80,
    "STA_N": 55
  },
  "destiny_guide": {
    "daily": "今日宜探索新知，嘗試不同的思考角度",
    "main": "強化自律習慣，提升執行效率",
    "side": "參加一場社交活動，挑戰你的舒適圈",
    "oracle": "平衡五行，方能掌握命運之輪"
  },
  "destiny_bonds": {
    "compatible": [
      {
        "class_id": "CLS_INFP",
        "class_name": "吟遊詩人",
        "description": "共享創意思維，互相激發靈感"
      }
    ],
    "conflicting": [
      {
        "class_id": "CLS_ESTJ",
        "class_name": "秩序騎士",
        "description": "自由度與規則性的矛盾"
      }
    ]
  }
}
```

### Enneagram 輸出範例：
```json
{
  "race_id": "RACE_1",
  "race_name": "鐵律族",
  "destiny_guide": {
    "daily": "今日宜深度思考，避免倉促決策",
    "main": "提升與他人的溝通技巧，平衡理性與感性",
    "side": "嘗試分享你的規劃給信任的朋友",
    "oracle": "孤獨的塔頂，是智者的試煉場"
  },
  "destiny_bonds": {
    "compatible": [
      {
        "class_id": "CLS_ENFP",
        "class_name": "元素召喚師",
        "description": "互補能量，激發創意與執行力"
      },
      {
        "class_id": "CLS_INFJ",
        "class_name": "神聖牧師",
        "description": "深層理解，共同追求遠大目標"
      }
    ],
    "conflicting": [
      {
        "class_id": "CLS_ESFJ",
        "class_name": "輔助神官",
        "description": "價值觀與行動方式差異過大"
      },
      {
        "class_id": "CLS_ESTP",
        "class_name": "暗影刺客",
        "description": "計劃性與即興性的劇烈衝突"
      }
    ]
  }
}

### DISC 輸出範例：
```json
{
  "stance_id": "STN_I",
  "stance_name": "潮汐之歌",
  "destiny_guide": {
    "daily": "今日宜深度思考，避免倉促決策",
    "main": "提升與他人的溝通技巧，平衡理性與感性",
    "side": "嘗試分享你的規劃給信任的朋友",
    "oracle": "孤獨的塔頂，是智者的試煉場"
  },
  "destiny_bonds": {
    "compatible": [
      {
        "class_id": "CLS_ENFP",
        "class_name": "元素召喚師",
        "description": "互補能量，激發創意與執行力"
      },
      {
        "class_id": "CLS_INFJ",
        "class_name": "神聖牧師",
        "description": "深層理解，共同追求遠大目標"
      }
    ],
    "conflicting": [
      {
        "class_id": "CLS_ESFJ",
        "class_name": "輔助神官",
        "description": "價值觀與行動方式差異過大"
      },
      {
        "class_id": "CLS_ESTP",
        "class_name": "暗影刺客",
        "description": "計劃性與即興性的劇烈衝突"
      }
    ]
  }
}
```

### Gallup 輸出範例：
```json
{
  "talent_ids": ["TAL_ACH", "TAL_ARR", "TAL_BEL", "TAL_CON", "TAL_DEL"],
  "talent_names": ["成就", "排定", "信仰", "公平", "謹慎"],
  "destiny_guide": {
    "daily": "今日宜深度思考，避免倉促決策",
    "main": "提升與他人的溝通技巧，平衡理性與感性",
    "side": "嘗試分享你的規劃給信任的朋友",
    "oracle": "孤獨的塔頂，是智者的試煉場"
  },
  "destiny_bonds": {
    "compatible": [
      {
        "class_id": "CLS_ENFP",
        "class_name": "元素召喚師",
        "description": "互補能量，激發創意與執行力"
      },
      {
        "class_id": "CLS_INFJ",
        "class_name": "神聖牧師",
        "description": "深層理解，共同追求遠大目標"
      }
    ],
    "conflicting": [
      {
        "class_id": "CLS_ESFJ",
        "class_name": "輔助神官",
        "description": "價值觀與行動方式差異過大"
      },
      {
        "class_id": "CLS_ESTP",
        "class_name": "暗影刺客",
        "description": "計劃性與即興性的劇烈衝突"
      }
    ]
  }
}

---

## ⚠️ 重要約束

1. **只能使用上方列出的合法 ID**
2. **必須同時輸出 ID 與完整物件**（如 class_id + class）
3. **destiny_bonds 的 compatible 與 conflicting 各需 2-3 個項目**
4. **唯一輸出方式：調用 `submit_transformation` 工具**
5. **所有類型都必須輸出 destiny_guide 與 destiny_bonds**
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

    **重要**：根據 quest_type 輸出不同的欄位組合，但 destiny_guide 與 destiny_bonds 為所有類型必填。

    Args:
        race_id: 靈魂種族 ID (RACE_1~9)。enneagram 測驗時必填。
        race: 種族完整物件 {id, name, description}。enneagram 測驗時必填。
        class_id: 英雄職業 ID (CLS_XXX)。mbti 測驗時必填。
        hero_class: 職業完整物件 {id, name, description}。mbti 測驗時必填。
        stats: 五大屬性數值 (0-100)，格式：{STA_O, STA_C, STA_E, STA_A, STA_N}。bigfive 測驗時必填。
        stance_id: 戰略姿態 ID (STN_X)。disc 測驗時必填。
        stance: 姿態完整物件 {id, name, description}。disc 測驗時必填。
        talent_ids: 傳奇技能 ID 列表 (2-3 個)。gallup 測驗時必填。
        talents: 技能完整物件列表 [{id, name, description}, ...]。gallup 測驗時必填。
        destiny_guide: 命運指引字典，**所有測驗必填**。
            格式：{
                "daily": "今日預言",
                "main": "主線任務",
                "side": "支線任務",
                "oracle": "神諭啟示"
            }
        destiny_bonds: 命運羈絆字典，**所有測驗必填**。
            格式：{
                "compatible": [
                    {"class_id": "CLS_XXX", "class_name": "...", "sync_rate": 85, "advantage": "..."}
                ],
                "conflicting": [
                    {"class_id": "CLS_XXX", "class_name": "...", "risk_level": "高", "friction_reason": "..."}
                ]
            }
        tool_context: 工具上下文。

    Returns:
        dict: 轉生報告，包含所有非 None 的值

    Examples:
        MBTI 範例：
        >>> submit_transformation(
        ...     class_id="CLS_INTJ",
        ...     hero_class={"id": "CLS_INTJ", "name": "戰略法師", "description": "獨立、戰略、高冷、冷靜"},
        ...     destiny_guide={"daily": "...", "main": "...", "side": "...", "oracle": "..."},
        ...     destiny_bonds={"compatible": [...], "conflicting": [...]}
        ... )
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


async def validate_transformation_output(
    tool_context: ToolContext, tool_response: dict, **kwargs
) -> dict:
    """
    after_tool_callback：驗證 submit_transformation 的輸出是否符合當前 quest_type，
    並透過 DB 查詢確認 ID 合法性。

    Args:
        tool_context: ADK 工具上下文
        tool_response: 工具執行的回應結果
        **kwargs: ADK 傳遞的其他參數（如 tool、args 等）

    驗證邏輯：
    1. 根據 quest_type 檢查必要欄位是否存在
    2. 驗證 destiny_guide 與 destiny_bonds 的格式
    3. 透過 DB 查詢確認所有 ID 存在於 game_definitions 表

    Returns:
        None: 驗證通過，使用原始結果
        dict: 若需修正結果，返回修正後的字典
    """
    from sqlalchemy import select
    from app.db.session import AsyncSessionLocal
    from app.db.models import GameDefinition

    quest_type = tool_context.state.get("quest_type")
    logger.info(f"🔍 開始驗證 Transformation 輸出 (quest_type={quest_type})")

    # 1. 定義每種測驗必須包含的欄位
    required_fields = {
        "mbti": ["class_id", "class", "destiny_guide", "destiny_bonds"],
        "enneagram": ["race_id", "race", "destiny_guide", "destiny_bonds"],
        "bigfive": ["stats", "destiny_guide", "destiny_bonds"],
        "disc": ["stance_id", "stance", "destiny_guide", "destiny_bonds"],
        "gallup": ["talent_ids", "talents", "destiny_guide", "destiny_bonds"],
    }

    expected = required_fields.get(quest_type, [])
    missing = [f for f in expected if not tool_response.get(f)]

    if missing:
        logger.warning(
            f"⚠️ Transformation 缺少必要欄位: {missing} (quest_type={quest_type})"
        )
        logger.warning(f"⚠️ 實際輸出欄位: {list(tool_response.keys())}")

    # 2. 驗證 destiny_guide 格式
    destiny_guide = tool_response.get("destiny_guide")
    if destiny_guide:
        required_guide_keys = ["daily", "main", "side", "oracle"]
        missing_guide_keys = [k for k in required_guide_keys if k not in destiny_guide]
        if missing_guide_keys:
            logger.warning(f"⚠️ destiny_guide 缺少欄位: {missing_guide_keys}")
    else:
        logger.warning("⚠️ 缺少 destiny_guide")

    # 3. 驗證 destiny_bonds 格式
    destiny_bonds = tool_response.get("destiny_bonds")
    if destiny_bonds:
        if "compatible" not in destiny_bonds:
            logger.warning("⚠️ destiny_bonds 缺少 compatible")
        elif (
            not isinstance(destiny_bonds["compatible"], list)
            or len(destiny_bonds["compatible"]) < 1
        ):
            logger.warning(
                f"⚠️ destiny_bonds.compatible 應為包含 1-3 個項目的列表，實際: {destiny_bonds.get('compatible')}"
            )

        if "conflicting" not in destiny_bonds:
            logger.warning("⚠️ destiny_bonds 缺少 conflicting")
        elif (
            not isinstance(destiny_bonds["conflicting"], list)
            or len(destiny_bonds["conflicting"]) < 1
        ):
            logger.warning(
                f"⚠️ destiny_bonds.conflicting 應為包含 1-3 個項目的列表，實際: {destiny_bonds.get('conflicting')}"
            )
    else:
        logger.warning("⚠️ 缺少 destiny_bonds")

    # 4. 收集需要驗證的 ID
    ids_to_validate = []
    
    if tool_response.get("class_id"):
        ids_to_validate.append(tool_response["class_id"])
    if tool_response.get("race_id"):
        ids_to_validate.append(tool_response["race_id"])
    if tool_response.get("stance_id"):
        ids_to_validate.append(tool_response["stance_id"])
    if tool_response.get("talent_ids"):
        ids_to_validate.extend(tool_response["talent_ids"])

    # 5. DB 查詢驗證
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

