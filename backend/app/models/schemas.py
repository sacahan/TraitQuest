"""
TraitQuest - 資料結構定義

此模組定義了測驗報告與英雄檔案的資料結構，使用 Pydantic models 進行驗證。

資料模型：
- QuestReport: 單次測驗報告（存於 user_quests.quest_report）
- HeroProfile: 完整英雄檔案（存於 users.hero_profile）

符合開發憲章第三條：遊戲化映射系統（The Grand Mapping）
- Enneagram → Race (種族)
- MBTI → Class (職業)
- Big Five → Stats (屬性)
- DISC → Stance (姿態)
- Gallup → Talent (天賦)
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional
from enum import Enum


# =============================================================================
# Enums - 資產 ID 定義
# =============================================================================

class RaceID(str, Enum):
    """九型人格種族 ID"""
    RACE_1 = "RACE_1"  # Type 1: 完美主義者
    RACE_2 = "RACE_2"  # Type 2: 助人者
    RACE_3 = "RACE_3"  # Type 3: 成就者
    RACE_4 = "RACE_4"  # Type 4: 個人主義者
    RACE_5 = "RACE_5"  # Type 5: 觀察者
    RACE_6 = "RACE_6"  # Type 6: 忠誠者
    RACE_7 = "RACE_7"  # Type 7: 享樂主義者
    RACE_8 = "RACE_8"  # Type 8: 挑戰者
    RACE_9 = "RACE_9"  # Type 9: 和平使者


class StanceID(str, Enum):
    """DISC 戰鬥姿態 ID"""
    STN_D = "STN_D"  # Dominance: 支配型
    STN_I = "STN_I"  # Influence: 影響型
    STN_S = "STN_S"  # Steadiness: 穩定型
    STN_C = "STN_C"  # Conscientiousness: 謹慎型


class StatID(str, Enum):
    """Big Five 屬性 ID"""
    STA_O = "STA_O"  # Openness: 開放性 → 智力
    STA_C = "STA_C"  # Conscientiousness: 嚴謹性 → 防禦
    STA_E = "STA_E"  # Extraversion: 外向性 → 速度
    STA_A = "STA_A"  # Agreeableness: 親和性 → 魅力
    STA_N = "STA_N"  # Neuroticism: 神經質 → 洞察


# =============================================================================
# GameDefinition metadata_info 結構
# =============================================================================

class RaceMetadata(BaseModel):
    """種族 metadata (Enneagram)"""
    enneagram: str = Field(..., description="九型人格類型（如：1型、2型）")
    center: str = Field(..., description="能量中心（本能/情感/精神）")
    description: str = Field(..., description="種族描述")


class ClassMetadata(BaseModel):
    """職業 metadata (MBTI)"""
    mbti: str = Field(..., description="MBTI 類型（如：INTJ）")
    alignment: str = Field(..., description="陣營（如：至高議會、皇家守衛）")
    traits: str = Field(..., description="職業特質描述")


class StanceMetadata(BaseModel):
    """姿態 metadata (DISC)"""
    disc: str = Field(..., description="DISC 類型（如：D 支配型）")
    description: str = Field(..., description="姿態描述")


class TalentMetadata(BaseModel):
    """天賦 metadata (Gallup)"""
    domain: str = Field(..., description="天賦領域（Executing/Influencing/Relationship Building/Strategic Thinking）")
    original: str = Field(..., description="原始英文名稱（如：Achiever）")


# =============================================================================
# UserQuest interactions 結構
# =============================================================================

class QuestionData(BaseModel):
    """問題資料"""
    id: Optional[str] = Field(None, description="問題 ID")
    type: Optional[str] = Field(None, description="問題類型（QUANTITATIVE/SOUL_NARRATIVE）")
    text: str = Field(..., description="問題文字")
    options: Optional[List[Dict[str, str]]] = Field(None, description="選項列表")
    visualFeedback: Optional[str] = Field(None, description="視覺回饋")


class Interaction(BaseModel):
    """單次互動記錄（一問一答）"""
    question: QuestionData = Field(..., description="問題資料")
    answer: str = Field(..., description="玩家回答")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "question": {
                    "id": "q_0_abc123",
                    "type": "QUANTITATIVE",
                    "text": "你偏好如何度過週末？",
                    "options": [
                        {"id": "opt_1", "text": "與朋友聚會"},
                        {"id": "opt_2", "text": "獨自閱讀"}
                    ]
                },
                "answer": "與朋友聚會"
            }
        }
    }


# =============================================================================
# 核心資料模型
# =============================================================================


class StatValue(BaseModel):
    """單一屬性值"""
    label: str = Field(..., description="屬性標籤（如：智力(O)）")
    score: int = Field(..., ge=0, le=100, description="屬性分數 (0-100)")


class Stats(BaseModel):
    """Big Five 五大屬性"""
    openness: StatValue = Field(..., description="開放性 → 智力(O)")
    conscientiousness: StatValue = Field(..., description="嚴謹性 → 防禦(C)")
    extraversion: StatValue = Field(..., description="外向性 → 速度(E)")
    agreeableness: StatValue = Field(..., description="親和性 → 魅力(A)")
    neuroticism: StatValue = Field(..., description="神經質 → 洞察(N)")
    
    @field_validator('*')
    @classmethod
    def validate_stat_value(cls, v):
        if not isinstance(v, StatValue):
            raise ValueError("Each stat must be a StatValue object")
        return v


class AssetReference(BaseModel):
    """遊戲資產引用（Race, Class, Stance, Talent）"""
    id: str = Field(..., description="資產 ID（如：RACE_1, CLS_INTJ）")
    name: str = Field(..., description="資產名稱（如：完美主義者）")
    description: str = Field(..., description="資產描述")


class DestinyGuide(BaseModel):
    """命運指引 - 艾比的預言"""
    daily: str = Field(..., description="今日預言：給予今天的行動啟示")
    main: str = Field(..., description="主線任務：下一階段的人格成長目標")
    side: str = Field(..., description="支線任務：有趣的行為實驗建議")
    oracle: str = Field(..., description="神諭：一段充滿深意的哲學短語")


class CompatibleBond(BaseModel):
    """相容羈絆（建議夥伴）"""
    class_id: str = Field(..., description="相容職業 ID（如：CLS_INFJ）")
    class_name: str = Field(..., description="相容職業名稱（如：調解者）")
    sync_rate: int = Field(..., ge=80, le=100, description="同步率 (80-100%)")
    advantage: str = Field(..., description="合作優勢描述")


class ConflictingBond(BaseModel):
    """衝突羈絆（警戒對象）"""
    class_id: str = Field(..., description="衝突職業 ID（如：CLS_ESTJ）")
    class_name: str = Field(..., description="衝突職業名稱（如：總經理）")
    risk_level: str = Field(..., description="風險等級（高/極高）")
    friction_reason: str = Field(..., description="摩擦原因描述")


class DestinyBonds(BaseModel):
    """命運羈絆 - 基於 MBTI 職業的相性分析"""
    compatible: List[CompatibleBond] = Field(..., description="建議夥伴（2-3 個）")
    conflicting: List[ConflictingBond] = Field(..., description="警戒對象（2-3 個）")
    
    @field_validator('compatible')
    @classmethod
    def validate_compatible_count(cls, v):
        if not (2 <= len(v) <= 3):
            raise ValueError("Compatible bonds must have 2-3 entries")
        return v
    
    @field_validator('conflicting')
    @classmethod
    def validate_conflicting_count(cls, v):
        if not (2 <= len(v) <= 3):
            raise ValueError("Conflicting bonds must have 2-3 entries")
        return v


# =============================================================================
# Level Info - 升級資訊
# =============================================================================

class LevelInfo(BaseModel):
    """升級資訊"""
    level: int = Field(..., description="當前等級")
    exp: int = Field(..., description="當前經驗值")
    isLeveledUp: bool = Field(False, description="是否升級")
    earnedExp: int = Field(0, description="獲得的經驗值")
    milestone: Optional[str] = Field(None, description="里程碑訊息")


# =============================================================================
# Quest Report - 單次測驗報告
# =============================================================================

class QuestReport(BaseModel):
    """
    單次測驗報告 - 用於 /analysis 頁面
    
    根據 quest_type 只包含對應的分析結果：
    - enneagram → race_id, race
    - mbti → class_id, class_
    - big_five → stats
    - disc → stance_id, stance
    - gallup → talent_ids, talents
    """
    quest_type: str = Field(..., description="測驗類型：mbti, big_five, disc, enneagram, gallup")
    
    # === 測驗結果（根據 quest_type 擇一填充）===
    race_id: Optional[str] = Field(None, description="靈魂種族 ID (Enneagram)")
    race: Optional[AssetReference] = Field(None, description="種族完整資料")
    
    class_id: Optional[str] = Field(None, description="英雄職業 ID (MBTI)")
    class_: Optional[AssetReference] = Field(None, alias="class", description="職業完整資料")
    
    stats: Optional[Stats] = Field(None, description="五大屬性 (Big Five)")
    
    stance_id: Optional[str] = Field(None, description="戰鬥姿態 ID (DISC)")
    stance: Optional[AssetReference] = Field(None, description="姿態完整資料")
    
    talent_ids: Optional[List[str]] = Field(None, description="天賦技能 ID 列表 (Gallup)")
    talents: Optional[List[AssetReference]] = Field(None, description="天賦完整資料列表")
    
    # === 通用內容 ===
    destiny_guide: DestinyGuide = Field(..., description="命運指引")
    destiny_bonds: Optional[DestinyBonds] = Field(None, description="命運羈絆")
    level_info: LevelInfo = Field(..., description="升級資訊")


# =============================================================================
# Hero Profile - 完整英雄檔案
# =============================================================================

class HeroProfile(BaseModel):
    """
    完整英雄檔案 - 用於 /dashboard 頁面
    
    此結構定義了 `users.hero_profile` JSONB 欄位的完整 schema。
    包含玩家完成所有五大測驗後的完整特質數據。
    
    符合開發憲章的「五大類型映射」：
    - Enneagram → Race (種族)
    - MBTI → Class (職業)
    - Big Five → Stats (屬性)
    - DISC → Stance (姿態)
    - Gallup → Talent (天賦)
    """
    
    # === 核心映射資料 ===
    race_id: Optional[str] = Field(None, description="靈魂種族 ID (Enneagram: RACE_1~9)")
    race: Optional[AssetReference] = Field(None, description="種族完整資料")
    
    class_id: Optional[str] = Field(None, description="英雄職業 ID (MBTI: CLS_INTJ...)")
    class_: Optional[AssetReference] = Field(None, alias="class", description="職業完整資料")
    
    stats: Optional[Stats] = Field(None, description="五大屬性 (Big Five)")
    
    stance_id: Optional[str] = Field(None, description="戰鬥姿態 ID (DISC: STN_D/I/S/C)")
    stance: Optional[AssetReference] = Field(None, description="姿態完整資料")
    
    talent_ids: Optional[List[str]] = Field(None, description="天賦技能 ID 列表 (Gallup: TAL_XXX)")
    talents: Optional[List[AssetReference]] = Field(None, description="天賦完整資料列表")
    
    # === 命運內容 ===
    destiny_guide: Optional[DestinyGuide] = Field(None, description="命運指引")
    destiny_bonds: Optional[DestinyBonds] = Field(None, description="命運羈絆")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "race_id": "RACE_5",
                "race": {
                    "id": "RACE_5",
                    "name": "觀察者",
                    "description": "知識追求者，以理性洞察世界"
                },
                "class_id": "CLS_INTJ",
                "class": {
                    "id": "CLS_INTJ",
                    "name": "建築師",
                    "description": "策略大師，擅長系統思考"
                },
                "stats": {
                    "openness": {"label": "智力(O)", "score": 85},
                    "conscientiousness": {"label": "防禦(C)", "score": 75},
                    "extraversion": {"label": "速度(E)", "score": 40},
                    "agreeableness": {"label": "魅力(A)", "score": 50},
                    "neuroticism": {"label": "洞察(N)", "score": 70}
                },
                "stance_id": "STN_C",
                "stance": {
                    "id": "STN_C",
                    "name": "謹慎戰術家",
                    "description": "以精密計算主宰戰場"
                },
                "talent_ids": ["TAL_STRATEGIC", "TAL_ANALYTICAL"],
                "talents": [
                    {
                        "id": "TAL_STRATEGIC",
                        "name": "戰略思維",
                        "description": "擅長制定長期計劃"
                    },
                    {
                        "id": "TAL_ANALYTICAL",
                        "name": "分析洞察",
                        "description": "快速解構複雜問題"
                    }
                ],
                "destiny_guide": {
                    "daily": "今日宜深度思考，避免倉促決策",
                    "main": "本月目標：提升溝通表達能力",
                    "side": "嘗試主動分享你的想法給他人",
                    "oracle": "智慧之光照亮孤獨的道路"
                },
                "destiny_bonds": {
                    "compatible": [
                        {
                            "class_id": "CLS_ENFP",
                            "class_name": "競選者",
                            "sync_rate": 90,
                            "advantage": "互補思維，激發創意"
                        }
                    ],
                    "conflicting": [
                        {
                            "class_id": "CLS_ESFJ",
                            "class_name": "執政官",
                            "risk_level": "高",
                            "friction_reason": "價值觀差異過大"
                        }
                    ]
                }
            }
        }
    }


# =============================================================================
# 輔助工具函數
# =============================================================================

def validate_hero_profile(data: dict) -> HeroProfile:
    """
    驗證並解析 hero_profile 資料
    
    Args:
        data: 待驗證的字典資料
        
    Returns:
        HeroProfile: 驗證通過的 Pydantic model
        
    Raises:
        ValidationError: 若資料格式不符合 schema
    """
    return HeroProfile(**data)


def validate_quest_report(data: dict) -> QuestReport:
    """
    驗證並解析 quest_report 資料
    
    Args:
        data: 待驗證的字典資料
        
    Returns:
        QuestReport: 驗證通過的 Pydantic model
        
    Raises:
        ValidationError: 若資料格式不符合 schema
    """
    return QuestReport(**data)


def merge_hero_profile(existing: dict, new_data: dict) -> dict:
    """
    合併現有的 hero_profile 與新的測驗結果
    
    用於增量更新英雄面板（符合憲章第六條）
    
    Args:
        existing: 現有的 hero_profile 資料
        new_data: 新的測驗結果
        
    Returns:
        dict: 合併後的完整資料
    """
    merged = existing.copy()
    
    # 更新各個欄位（只覆蓋非 None 的值）
    for key, value in new_data.items():
        if value is not None:
            merged[key] = value
    
    return merged


# =============================================================================
# MetadataInfo 驗證工具
# =============================================================================

def validate_metadata_info(category: str, data: dict):
    """
    根據資產類別驗證 metadata_info
    
    Args:
        category: 資產類別（race/class/stance/talent）
        data: metadata_info 資料
        
    Returns:
        Pydantic model: 驗證通過的 model
        
    Raises:
        ValidationError: 若資料格式不符合 schema
    """
    metadata_models = {
        "race": RaceMetadata,
        "class": ClassMetadata,
        "stance": StanceMetadata,
        "talent": TalentMetadata
    }
    
    model_class = metadata_models.get(category)
    if not model_class:
        raise ValueError(f"Unknown category: {category}")
    
    return model_class(**data)


def validate_interactions(interactions: list) -> List[Interaction]:
    """
    驗證 interactions 列表
    
    Args:
        interactions: 互動記錄列表
        
    Returns:
        List[Interaction]: 驗證通過的互動列表
        
    Raises:
        ValidationError: 若資料格式不符合 schema
    """
    return [Interaction(**item) for item in interactions]

