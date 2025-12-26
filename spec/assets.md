# TraitQuest：預定義遊戲資產庫

**版本**: V1.0  
**最後更新**: 2025-12-23

---

## 📋 文件說明

本文件詳細列出了 **TraitQuest** 系統中所有預定義的遊戲要素，包括靈魂種族、英雄職業、戰略姿態及傳奇技能。

⚠️ **重要約束**：AI GM 在生成內容與分析結果時，**必須嚴格遵守此表中的 ID 與對應關係，嚴禁自創**。

---

## 一、靈魂種族 (Race)

**分析工具來源**：九型人格 (Enneagram)

| 種族 ID  | 顯示名稱             | 對應九型 | 智慧中心 | 種族描述 (靈魂起源)                      |
| -------- | -------------------- | -------- | -------- | ---------------------------------------- |
| `RACE_1` | 鐵律族 (Iron Law)    | 1 型     | 本能     | 追求秩序與完美的靈魂，源自遠古法典之山。 |
| `RACE_2` | 聖靈族 (Holy Spirit) | 2 型     | 情感     | 渴望被愛與付出的靈魂，源自生命之泉。     |
| `RACE_3` | 輝光族 (Radiant)     | 3 型     | 情感     | 追求成就與注視的靈魂，源自永恆烈陽。     |
| `RACE_4` | 幻影族 (Phantom)     | 4 型     | 情感     | 沉浸於獨特與憂傷的靈魂，源自迷霧森林。   |
| `RACE_5` | 智者族 (Sage)        | 5 型     | 精神     | 渴求知識與觀察的靈魂，源自星辰圖書館。   |
| `RACE_6` | 堅盾族 (Aegis)       | 6 型     | 精神     | 追求安全與忠誠的靈魂，源自地下堡壘。     |
| `RACE_7` | 秘風族 (Secret Wind) | 7 型     | 精神     | 追求自由與新奇的靈魂，源自流浪之雲。     |
| `RACE_8` | 霸龍族 (Overlord)    | 8 型     | 本能     | 追求力量與控制的靈魂，源自火山熔岩。     |
| `RACE_9` | 蒼翠族 (Verdant)     | 9 型     | 本能     | 追求和平與融合的靈魂，源自萬物母林。     |

---

## 二、英雄職業 (Class)

**分析工具來源**：16 型人格 (MBTI)

| 職業 ID    | 英雄職稱   | 對應 MBTI | 陣營     | 職業核心特質             |
| ---------- | ---------- | --------- | -------- | ------------------------ |
| `CLS_INTJ` | 戰略法師   | INTJ      | 至高議會 | 獨立、戰略、高冷、冷靜。 |
| `CLS_INTP` | 煉金術士   | INTP      | 至高議會 | 好奇、創新、邏輯、實驗。 |
| `CLS_ENTJ` | 領主騎士   | ENTJ      | 至高議會 | 領導、果斷、高效、野心。 |
| `CLS_ENTP` | 混沌術士   | ENTP      | 至高議會 | 聰穎、批判、變通、幽默。 |
| `CLS_INFJ` | 神聖牧師   | INFJ      | 縱橫捭闔 | 神秘、同理、堅定、理想。 |
| `CLS_INFP` | 吟遊詩人   | INFP      | 縱橫捭闔 | 溫柔、創意、忠於自我。   |
| `CLS_ENFJ` | 光明聖騎士 | ENFJ      | 縱橫捭闔 | 魅力、熱情、利他、組織。 |
| `CLS_ENFP` | 元素召喚師 | ENFP      | 縱橫捭闔 | 活力、想像、自由、熱誠。 |
| `CLS_ISTJ` | 重裝守衛   | ISTJ      | 皇家守衛 | 實務、責任、誠實、紀律。 |
| `CLS_ISFJ` | 守護治療師 | ISFJ      | 皇家守衛 | 守護、體貼、可靠、耐心。 |
| `CLS_ESTJ` | 秩序騎士   | ESTJ      | 皇家守衛 | 權威、管理、公正、直接。 |
| `CLS_ESFJ` | 輔助神官   | ESFJ      | 皇家守衛 | 合作、慷慨、社交、和諧。 |
| `CLS_ISTP` | 武器工匠   | ISTP      | 探險聯盟 | 靈活、觀察、技術、冷靜。 |
| `CLS_ISFP` | 森林遊俠   | ISFP      | 探險聯盟 | 感性、審美、冒險、低調。 |
| `CLS_ESTP` | 暗影刺客   | ESTP      | 探險聯盟 | 行動、大膽、理性、感知。 |
| `CLS_ESFP` | 幻術舞者   | ESFP      | 探險聯盟 | 娛樂、自發、社交、表演。 |

---

## 三、對戰風格 (Stance)

**分析工具來源**：行為風格 (DISC)

| 姿態 ID | 戰姿名稱                   | 對應 DISC | 戰鬥風格描述               |
| ------- | -------------------------- | --------- | -------------------------- |
| `STN_D` | 烈焰戰姿 (Blazing Assault) | D 支配型  | 快速進攻，以力量壓制對手。 |
| `STN_I` | 潮汐之歌 (Tidal Harmony)   | I 影響型  | 激勵隊友，以魅力掌控全場。 |
| `STN_S` | 大地磐石 (Earthen Rock)    | S 穩健型  | 穩守陣地，以韌性保護夥伴。 |
| `STN_C` | 星辰軌跡 (Starry Orbit)    | C 分析型  | 佈下陷阱，以邏輯解構威脅。 |

---

## 四、傳奇技能 (Talent)

**分析工具來源**：34 種天賦主題 (Gallup)

技能分為四大領域，AI 需根據玩家最突出的天賦選擇 **2-3 個 ID**。

### 1. 執行領域 (Executing Domain)

| 技能 ID   | 技能名稱 | 英文原名       |
| --------- | -------- | -------------- |
| `TAL_ACH` | 成就     | Achiever       |
| `TAL_ARR` | 排定     | Arranger       |
| `TAL_BEL` | 信仰     | Belief         |
| `TAL_CON` | 公平     | Consistency    |
| `TAL_DEL` | 謹慎     | Deliberative   |
| `TAL_DIS` | 紀律     | Discipline     |
| `TAL_FOC` | 專注     | Focus          |
| `TAL_RES` | 責任     | Responsibility |
| `TAL_RSV` | 修復     | Restorative    |

### 2. 影響領域 (Influencing Domain)

| 技能 ID   | 技能名稱 | 英文原名       |
| --------- | -------- | -------------- |
| `TAL_ACT` | 激活     | Activator      |
| `TAL_COM` | 統率     | Command        |
| `TAL_CMU` | 溝通     | Communication  |
| `TAL_CPT` | 競爭     | Competition    |
| `TAL_MAX` | 完美     | Maximizer      |
| `TAL_SAD` | 自信     | Self-Assurance |
| `TAL_SIG` | 追求     | Significance   |
| `TAL_WOO` | 取悅     | Woo            |

### 3. 關係領域 (Relationship Building Domain)

| 技能 ID   | 技能名稱 | 英文原名          |
| --------- | -------- | ----------------- |
| `TAL_ADP` | 適應     | Adaptability      |
| `TAL_CON` | 關聯     | Connectedness     |
| `TAL_DEV` | 發展     | Developer         |
| `TAL_EMP` | 共感     | Empathy           |
| `TAL_HAR` | 和諧     | Harmony           |
| `TAL_INC` | 包容     | Includer          |
| `TAL_IND` | 個別     | Individualization |
| `TAL_POS` | 積極     | Positivity        |
| `TAL_REL` | 交往     | Relator           |

### 4. 思維領域 (Strategic Thinking Domain)

| 技能 ID   | 技能名稱 | 英文原名     |
| --------- | -------- | ------------ |
| `TAL_ANA` | 分析     | Analytical   |
| `TAL_CTX` | 回顧     | Context      |
| `TAL_FUT` | 前瞻     | Futuristic   |
| `TAL_IDE` | 理念     | Ideation     |
| `TAL_INP` | 蒐集     | Input        |
| `TAL_ITL` | 思維     | Intellection |
| `TAL_LEA` | 學習     | Learner      |
| `TAL_STR` | 戰略     | Strategic    |

---

**文件版本**: V1.0  
**最後更新**: 2025-12-23
