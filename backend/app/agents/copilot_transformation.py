"""
Copilot SDK 版本 - Transformation Agent

使用 GitHub Copilot SDK
"""
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from app.core.tools import create_copilot_tool
from app.core.config import settings

logger = logging.getLogger("app")

TRANSFORMATION_INSTRUCTION = """你是 TraitQuest 的「轉生代理」，負責將心理測評結果映射為遊戲資產。

## 🎯 輸出規則

**根據 quest_type 輸出對應欄位（所有類型都必須輸出 destiny_guide 與 destiny_bonds）**：

| quest_type | 必須輸出的欄位 |
|-----------|------------|
| mbti      | class_id, hero_class, destiny_guide, destiny_bonds |
| enneagram | race_id, race, destiny_guide, destiny_bonds |
| bigfive   | stats, destiny_guide, destiny_bonds |
| disc      | stance_id, stance, destiny_guide, destiny_bonds |
| gallup    | talent_ids, talents, destiny_guide, destiny_bonds |

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
| RACE_1 | The Perfectionist | 追求秩序與完美的靈魂，源自遠古法典之山 | 鐵律之魂 |
| RACE_2 | The Helper | 渴望被愛與付出的靈魂，源自生命之泉 | 聖靈之魂 |
| RACE_3 | The Achiever | 追求成就與注視的靈魂，源自永恆烈陽 | 輝光之魂 |
| RACE_4 | The Romantic | 沉浸於獨特與憂傷的靈魂，源自迷霧森林 | 幻影之魂 |
| RACE_5 | The Observer | 渴求知識與觀察的靈魂，源自星辰圖書館 | 智者之魂 |
| RACE_6 | The Loyalist | 追求安全與忠誠的靈魂，源自地下堡壘 | 堅盾之魂 |
| RACE_7 | The Epicure | 追求自由與新奇的靈魂，源自流浪之雲 | 秘風之魂 |
| RACE_8 | The Challenger | 追求力量與控制的靈魂，源自火山熔岩 | 霸龍之魂 |
| RACE_9 | The Peacemaker | 追求和平與融合的靈魂，源自萬物母林 | 蒼翠之魂 |

### Big Five → 屬性 (Stats)
輸出 key: STA_O, STA_C, STA_E, STA_A, STA_N 與 value: 累積數值 (0-100) 的字典

### DISC → 姿態 (Stance)
| ID | 名稱 | 特性 | 戰技 |
|----|------|------|
| STN_D | Dominance | 快速進攻，以力量壓制 | 烈焰戰姿 | 
| STN_I | Influence | 激勵隊友，以魅力掌控 | 潮汐之歌 |
| STN_S | Steadiness | 穩守陣地，以韌性保護 | 大地磐石 |
| STN_C | Compliance | 佈下陷阱，以邏輯解構 | 星辰軌跡 |

### Gallup → 天賦 (Talent)
選出 6 個最契合的技能，共 33 種天賦：

| ID | 名稱 | Symbol |
|----|------|------|
| TAL_ACH | 成就 | flag  |
| TAL_ARR | 排定 | tune |
| TAL_BEL | 信仰 | verified |
| TAL_CON | 公平 | balance |
| TAL_DEL | 謹慎 | shield |
| TAL_DIS | 紀律 | rule |
| TAL_FOC | 專注 | center_focus_strong |
| TAL_RES | 責任 | task_alt |
| TAL_RSV | 修復 | healing |
| TAL_ACT | 激活 | bolt |
| TAL_COM | 統率 | campaign |
| TAL_CMU | 溝通 | chat |
| TAL_CPT | 競爭 | emoji_events |
| TAL_MAX | 完美 | diamond |
| TAL_SAD | 自信 | accessibility_new |
| TAL_SIG | 追求 | star |
| TAL_WOO | 取悅 | group_add |
| TAL_ADP | 適應 | waves |
| TAL_CNR | 關聯 | hub |
| TAL_DEV | 發展 | sprout |
| TAL_EMP | 共感 | favorite |
| TAL_HAR | 和諧 | handshake |
| TAL_INC | 包容 | all_inclusive |
| TAL_IND | 個別 | fingerprint |
| TAL_POS | 積極 | sunny |
| TAL_REL | 交往 | diversity_1 |
| TAL_ANA | 分析 | analytics |
| TAL_CTX | 回顧 | history |
| TAL_FUT | 前瞻 | visibility |
| TAL_IDE | 理念 | lightbulb |
| TAL_INP | 蒐集 | inventory_2 |
| TAL_ITL | 思維 | psychology |
| TAL_LEA | 學習 | school |
| TAL_STR | 戰略 | route |
"""

class TransformationParams(BaseModel):
    race_id: Optional[str] = Field(default=None, description="靈魂種族 ID")
    race: Optional[dict] = Field(default=None, description="種族完整物件")
    class_id: Optional[str] = Field(default=None, description="英雄職業 ID")
    hero_class: Optional[dict] = Field(default=None, description="職業完整物件")
    stats: Optional[dict] = Field(default=None, description="五大屬性數值")
    stance_id: Optional[str] = Field(default=None, description="戰略姿態 ID")
    stance: Optional[dict] = Field(default=None, description="姿態完整物件")
    talent_ids: Optional[List[str]] = Field(default=None, description="傳奇技能 ID 列表")
    talents: Optional[List[dict]] = Field(default=None, description="技能完整物件列表")
    destiny_guide: dict = Field(description="命運指引字典")
    destiny_bonds: dict = Field(description="命運羈絆字典")


async def submit_transformation(params: TransformationParams) -> dict:
    """提交最終的英雄轉生報告"""
    result = {}
    
    if params.stats is not None: result["stats"] = params.stats
    if params.race_id is not None: result["race_id"] = params.race_id
    if params.race is not None: result["race"] = params.race
    if params.class_id is not None: result["class_id"] = params.class_id
    if params.hero_class is not None: result["class"] = params.hero_class
    if params.stance_id is not None: result["stance_id"] = params.stance_id
    if params.stance is not None: result["stance"] = params.stance
    if params.talent_ids is not None: result["talent_ids"] = params.talent_ids
    if params.talents is not None: result["talents"] = params.talents
    
    result["destiny_guide"] = params.destiny_guide
    result["destiny_bonds"] = params.destiny_bonds
    
    return result


def create_transformation_tools() -> list:
    """建立工具列表"""
    return [
        create_copilot_tool(
            name="submit_transformation",
            description="提交英雄轉生結果",
            handler=submit_transformation,
            params_model=TransformationParams
        ),
    ]


def get_transformation_session_id(user_id: str, session_id: str) -> str:
    return f"transformation_{user_id}_{session_id}"
