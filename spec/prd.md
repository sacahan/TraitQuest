# TraitQuest：AI 驅動遊戲化人格分析系統技術規格說明書

---

## 一、系統概述 (System Overview)

**TraitQuest** 是一個將深層心理學分析與黑暗奇幻 RPG 體驗結合的平台。透過 AI Game Master (GM) 的敘事引導，系統將玩家的心理測驗結果（MBTI, Big Five, DISC, Enneagram, Gallup）轉化為角色的靈魂構造（種族、職業、屬性、戰姿、技能），創造出一個具備成長感與社群深度的自我探索系統。

---

## 二、前端設計與視覺規範 (Visual Spec)

### 1. 視覺風格 (Visual Style)

- **主題方向**：黑暗奇幻 (Dark Fantasy) 與擬物化 (Skeuomorphism) 風格
- **主要素材**：羊皮紙卷軸、金屬雕花邊框、魔法符文、Q 版與寫實交織的角色插畫

### 2. 色彩規範 (Color Palette)

| 色彩類型                | 色碼      | 說明                             |
| ----------------------- | --------- | -------------------------------- |
| **背景色 (Background)** | `#102216` | 深綠黑，營造深淵與森林的神祕感   |
| **主色調 (Primary)**    | `#11D452` | 螢光綠，象徵靈魂能量與系統高亮   |
| **輔助色 (Secondary)**  | `#D4AF37` | 古金，用於邊框、稱號與稀有度標籤 |

#### 特徵識別色

- **MBTI**：電光藍
- **DISC**：戰意紅
- **Big Five**：森林綠
- **Enneagram**：冥思紫
- **Gallup**：古代黃

### 3. 核心組件視覺定義

#### 世界地圖 (World Map)

包含五大據點（MBTI 聖殿、Big Five 屬性之泉、DISC 戰鬥叢林、九型人格塔、蓋洛普祭壇）。未解鎖區域需覆蓋動態迷霧。

#### 副本對話視窗 (Quest UI)

- 採用**打字機效果**呈現 NPC 艾比 (Abby) 的敘事
- 右側設置五大維度即時感應槽，隨玩家回答產生閃爍動畫

#### 英雄面板 (Result Analysis)

- **核心形象區**：左側展示動態角色肖像、SSR 稱號、**覺醒進度 (Awakening)** 與 **法力充能 (Mana Charge)**。
- **五大系統狀態**：中央以卡片形式呈現 Enneagram (種族)、MBTI (職業)、Big Five (屬性雷達圖)、DISC (戰姿)、Gallup (技能)。
    - **解鎖機制**：未完成的測驗顯示鎖定狀態與解鎖引導。
- **命運指引 (Destiny Guide)**：底部呈現四類動態建議：
    - **每日預言 (Daily)**：根據今日人格相位給予的建議。
    - **主線任務 (Main)**：長期成長的關鍵挑戰。
    - **支線任務 (Side)**：探索自我潛能的小任務。
    - **神諭 (Oracle)**：深度解析與警示。
- **命運羈絆 (Destiny Bonds)**：提供相性分析：
    - **建議夥伴 (Compatible)**：最適合組隊的人格類型及其加成。
    - **警戒對象 (Conflicting)**：應保持距離的類型與風險提示。

---

## 三、系統架構與多代理設計 (Multi-Agent Architecture)

TraitQuest 採用由 **Orchestrator (策劃代理)** 統籌的五大代理協作模型，確保從敘事引導到數據驗證的完整性。其運作流程可分為「循環對話階段」與「最終轉換階段」：

### 1. 循環對話階段 (The Interaction Loop)

此階段旨在透過 RPG 劇情採集玩家心理特徵：

- **Questionnaire Agent (說書人)**：
    作為引導者「艾比 (Abby)」，讀取玩家的 `hero_chronicle` (長期記憶) 與當前等級，動態生成包裹在 RPG 劇情中的情境題目。

- **Analytics Agent (分析官)**：
    接收玩家回答後，將非結構化的對話解析為**結構化的心理標籤增量**（如：`Openness +0.2`），並評估回答品質 (`quality_score`) 以決定經驗值加成。每次答題後即時執行。

- **Summary Agent (史官)**：
    將該輪對話歷程與性格趨勢壓縮為 300 字內的 `hero_chronicle` 摘要，確保 AI GM 在跨 Session 或跨題目時具備「長期記憶」能力。每 10 輪對話或測驗結束時觸發。

### 2. 最終轉換階段 (The Final Transformation)

當測驗完成後，系統進入嚴格的資料寫入流程：

- **Transformation Agent (轉生代理)**：
    執行「轉生儀式」，將 Analytics Agent 累積的**所有心理標籤增量加總後**，映射至預定義的遊戲資產 ID (如 `RACE_5`, `CLS_INTJ`)。同時生成「命運指引」與「命運羈絆」等敘事內容。
    
    **核心職責**：標籤映射 (Mapping) 與敘事生成，而非分析 (Analysis)。

- **Validator Agent (守望者)**：
    系統的最後防線，負責「校對」Transformation Agent 產出的 ID 是否存在於 `game_definitions` 真值清單中。若發現 AI 幻覺 (自創 ID) 或 JSON 語義矛盾，將強制執行重試機制。

> Agent Prompt 詳細定義可見 [templates](templates.md)。

---

## 四、持久化架構設計 (Persistence & Cache)

系統使用 **PostgreSQL (JSONB)** 作為核心存儲，輔以 **Redis** 提升效能。

### 1. PostgreSQL 資料表結構

#### `users` 表

儲存玩家帳號。

**欄位**：

- `google_id` (Unique Index)
- `email`
- `display_name`
- `avatar_url`
- `level`
- `exp`

#### `traits` 表

儲存結構化英雄面板。

**欄位**：

- `userId` (PK)
- `final_report` (JSONB)：包含種族、職業、雷達圖數值、已解鎖技能

#### `user_quests` 表

儲存測驗歷程。

**欄位**：

- `id`
- `userId`
- `interactions` (JSONB)：存儲每一輪對話的題目與玩家回答

#### `game_definitions` 表

儲存封閉式資產庫。

**欄位**：

- `id`
- `category` (RACE/CLASS/TALENT)
- `key_code`
- `display_name`
- `description`
- `metadata` (JSONB)

### 2. 索引策略 (Index Strategy)

⚠️ **重要**：為避免過度使用 GIN 索引造成 OOM，**禁止對大的 JSONB 欄位建立全量索引**。

使用**功能性索引 (Functional Index)**，例如：

```sql
CREATE INDEX idx_user_class ON traits ((final_report->>'class_id'));
```

### 3. Redis 快取角色

| 快取類型              | 用途                             | 設定            |
| --------------------- | -------------------------------- | --------------- |
| **Session Cache**     | 緩存當前副本最後 3 輪對話        | 30 分鐘過期     |
| **Leaderboard Cache** | 使用 Redis ZSET 儲存全球積分排名 | 每小時同步至 DB |

---

## 五、API Contract (前後端資料溝通協議)

### 1. 身份驗證與登入

**Endpoint**: `POST /v1/auth/login`

**Request**:

```json
{
  "token": "Google_ID_Token"
}
```

**Response**:

```json
{
  "userId": "uuid",
  "level": 1,
  "isNewUser": true
}
```

### 2. 測驗互動核心

**Endpoint**: `POST /v1/quests/interact`

**Request**:

```json
{
  "sessionId": "uuid",
  "answer": "string",
  "questId": "string"
}
```

**Response**:

```json
{
  "isCompleted": false,
  "narrative": "AI 劇情文字...",
  "nextQuestion": {
    "type": "QUANTITATIVE|SOUL_NARRATIVE",
    "text": "題目內容...",
    "options": ["選項1", "選項2"]
  },
  "expGained": 15
}
```

### 3. 分析結果獲取

**Endpoint**: `GET /v1/quests/{sessionId}/result`

**Response**: 回傳符合 RPG 整合架構的 JSONB 數據（見第七章）。

---

## 六、RPG 整合架構與映射邏輯

### 1. 靈魂構造映射規則

系統嚴格執行以下跨工具映射，**AI 不得自行調整映射欄位**：

| 分析工具      | 映射 RPG 要素     | 詳細邏輯                                     |
| ------------- | ----------------- | -------------------------------------------- |
| **Enneagram** | 種族 (Race)       | 九型人格中心 → 種族。影響 MP 回復效率        |
| **MBTI**      | 核心職業 (Class)  | 16 型人格 → 職業原型。定義角色外觀與決策邏輯 |
| **Big Five**  | 屬性數值 (Stats)  | O→ 智力, C→ 防禦, E→ 速度, A→ 魅力, N→ 洞察  |
| **DISC**      | 戰略姿態 (Stance) | 行為風格 → 戰鬥動作描述（攻、援、守、算）    |
| **Gallup**    | 技能樹 (Talent)   | 34 種天賦 → 2-3 個主/被動技能 ID             |

### 2. 升級與成長

#### 經驗值 (EXP) 計算

```
Total_EXP = 基礎點數(10) × 分析品質加成(1.2~2.0)
```

#### Session 回復

採取 **Fresh Start 策略**。斷線不恢復進度，需重啟副本，但 AI GM 透過長期摘要保持敘事連貫性。

---

## 七、預定義遊戲資產庫 (Pre-defined Assets)

AI GM **僅能從以下列表中提取 ID**。

### 1. 靈魂種族 (Race_ID: RACE_1 ~ RACE_9)

鐵律族、聖靈族、輝光族、幻影族、智者族、堅盾族、秘風族、霸龍族、蒼翠族

### 2. 英雄職業 (Class_ID: CLS_XXXX)

包含：

- `CLS_INTJ` (深淵謀略家)
- `CLS_INFP` (流浪詩人)
- `CLS_ENTJ` (帝國統帥)
- ... 等共 **16 種**

### 3. 戰略姿態 (Stance_ID: STN_D, STN_I, STN_S, STN_C)

- `STN_D`：烈焰戰姿 (攻)
- `STN_I`：潮汐之歌 (援)
- `STN_S`：大地磐石 (守)
- `STN_C`：星辰軌跡 (算)

### 4. 傳奇技能 (Talent_ID: TAL_XXX)

共 **34 項**，如：

- `TAL_ACH` (成就者)
- `TAL_STR` (戰略家)
- `TAL_EMP` (共感者)
- ... 等

> 詳細預定義技能請見 [assets.md](assets.md)

---

## 八、UI 互動與測驗邏輯 (UX Logic)

### 1. 互動模式分級

| 等級範圍      | 模式名稱 | 說明                                                                                          |
| ------------- | -------- | --------------------------------------------------------------------------------------------- |
| **Lv.1 - 10** | 量化試煉 | 介面僅提供五段式按鈕（Strongly Disagree ~ Strongly Agree），用於精確採集基礎人格權重          |
| **Lv.11+**    | 靈魂對話 | 解鎖「開放式輸入框」。玩家可自行輸入行動敘述，AI 將根據語義解析性格特徵，並給予更高的品質 EXP |

### 2. UI 反饋機制

#### 打字機特效

所有 AI 敘事文字必須以**逐字呈現方式**展示。

#### 品質感應

當玩家輸入高品質的敘述（字數達標且具備語意深度）時，後端將回傳 `visualFeedback: "GLOW_EFFECT"`，畫面上會出現**符文發光與螢幕震動特效**，並給予額外的分析品質加成。

---

## 九、未來擴充性 (Scalability)

### 神秘學模組

系統預留可插入「**紫微斗數**」或「**占星術**」的據點位點，採樣邏輯相同。

### 公會對比系統

可透過 SQL 快速計算兩位玩家 `traits` 表中的 `final_report` 相似度，生成相性報告。

---

**文件版本**: 1.0  
**最後更新**: 2025-12-23
