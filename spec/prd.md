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

### 3. 系統一致性與 Context 運作機制

雖然 REST API 本質上是無狀態的,但 TraitQuest 透過精心設計的持久化與 Context 管理機制,讓玩家體驗到具備完整記憶、能根據過往選擇給予回饋的連續遊戲體驗。

#### 3.1 結構化狀態的持久化 (Database as Source of Truth)

系統透過 `sessionId` 將每一次 Request 連結到後端的持久化存儲:

- **Redis Session Cache**:緩存當前副本最後 3 輪的原始對話,確保在極短時間內的互動具備即時反應能力。

- **PostgreSQL (JSONB)**:在 `user_quests` 表的 `interactions` 欄位中,增量存儲每一輪的題目、玩家回答與分析標籤。

- **Orchestrator 的角色**:當新的 API 請求進入時,策劃者會先從資料庫撈取該 `sessionId` 的歷史紀錄,將其重新注入 (Inject) 到下一個 Agent 的 Prompt 中。

#### 3.2 語義化 Context 壓縮:Summary Agent (史官)

若直接將 10 幾次的對話全量丟給 AI,會迅速耗盡 Token 視窗並導致 AI 混亂。系統引入了 Summary Agent 來解決這點:

- **長期記憶摘要 (hero_chronicle)**:史官負責將長期的對話紀錄壓縮為精煉的語意摘要。

- **Context 橋接**:每一次呼叫 Questionnaire Agent (說書人) 時,策劃者都會將這個最新的 `hero_chronicle` 帶入 User Prompt 變數中。

- **敘事連貫性**:這讓說書人即使在第 10 題,也能透過摘要知道玩家在第 1 題時的關鍵抉擇(例如:「既然你之前選擇了守護森林,那麼現在面對火災...」),從而維持角色的「靈魂一致性」。

#### 3.3 多代理間的數據流轉 (Data Pipeline)

為了確保最後的分析結果 (Result Analysis) 能讀取到前 10 次對話的精髓,數據是按以下路徑傳遞的:

- **Analytics Agent**:將每一輪玩家的回答轉化為 `trait_deltas`(標籤增量,如:外向性 +0.2)並存入 DB。

- **累積標籤 (Accumulated Tags)**:當測驗結束時,策劃者會聚合 (Aggregate) 這場 Session 的所有增量數值。

- **Result Analysis Agent**:最後參與的分析代理並非直接讀取 10 次對話,而是讀取這份「聚合後的數據包」以及史官的「最終摘要」來產出英雄面板。

#### 3.4 嚴格的驗證機制:Validator Agent (守望者)

在多輪互動中,AI 可能會因為 Context 累積而產生幻覺(例如產出不存在的 ID)。

- 系統在寫入資料庫前,由 Validator Agent 進行最後校對,確保所有生成的數據與 `game_definitions`(資料庫真值清單)一致。

- 若驗證失敗,系統會利用持久化的狀態重新啟動生成,而非讓玩家重新做 10 題測驗。

#### 3.5 維持一致性的關鍵公式

```
一致性 = (sessionId 索引的 DB 歷史紀錄) 
       + (Summary Agent 壓縮的語義摘要) 
       + (Orchestrator 每一輪的 Context 注入)
```

這種做法將「AI 的短期記憶 (Prompt)」轉化為「系統的長期記憶 (DB)」,使得即使 REST API 本身是無狀態的,玩家感受到的卻是一個具備完整記憶、能根據過往選擇給予回饋的連續遊戲體驗。

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

### 1. 身份驗證與登入 (REST)

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
  "isNewUser": true,
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 用於 WebSocket 認證
}
```

### 2. 測驗互動核心 (WebSocket)

#### 連線建立

**WebSocket URL**: `ws://[host]/v1/quests/ws?sessionId={sessionId}&token={jwtToken}`

**連線流程**:
1. 前端透過 REST API 登入,取得 JWT Token
2. 前端發起 WebSocket 連線,帶入 sessionId 與 token
3. 後端驗證 token,建立連線並綁定 sessionId
4. 測驗結束或連線逾時後自動關閉

#### Client → Server 事件

**事件類型**: `start_quest`

```json
{
  "event": "start_quest",
  "data": {
    "questId": "mbti|big5|disc|enneagram|gallup"
  }
}
```

**事件類型**: `submit_answer`

```json
{
  "event": "submit_answer",
  "data": {
    "answer": "玩家的回答內容",
    "questionIndex": 1
  }
}
```

**事件類型**: `request_result`

```json
{
  "event": "request_result",
  "data": {}
}
```

#### Server → Client 事件

**事件類型**: `first_question`

```json
{
  "event": "first_question",
  "data": {
    "narrative": "艾比 (Abby) 的副本引導文字...",
    "question": {
      "type": "QUANTITATIVE|SOUL_NARRATIVE",
      "text": "題目內容...",
      "options": ["選項1", "選項2"]
    }
  }
}
```

**事件類型**: `next_question`

```json
{
  "event": "next_question",
  "data": {
    "questionIndex": 2,
    "narrative": "AI 劇情文字...",
    "question": {
      "type": "QUANTITATIVE|SOUL_NARRATIVE",
      "text": "題目內容...",
      "options": ["選項1", "選項2"]
    },
    "expGained": 15,
    "visualFeedback": "GLOW_EFFECT" // 高品質回答觸發符文發光特效
  }
}
```

**事件類型**: `quest_complete`

```json
{
  "event": "quest_complete",
  "data": {
    "message": "測驗完成,正在生成你的英雄面板...",
    "totalExp": 150
  }
}
```

**事件類型**: `final_result`

```json
{
  "event": "final_result",
  "data": {
    // 完整的 RPG 整合架構 JSONB 數據(見第七章)
    "race_id": "RACE_5",
    "class_id": "CLS_INTJ",
    ...
  }
}
```

**事件類型**: `error`

```json
{
  "event": "error",
  "data": {
    "code": "ANALYSIS_TIMEOUT|VALIDATION_FAILED|...",
    "message": "錯誤描述",
    "recoverable": true
  }
}
```

### 3. 非同步分析機制

當玩家提交答案後,系統執行以下流程:

1. **立即回應**: Orchestrator 調用 Questionnaire Agent 生成下一題,透過 WebSocket 立即推送給前端
2. **後台分析**: 同時啟動 Analytics Agent 非同步任務,分析玩家回答並寫入資料庫
3. **最終聚合**: 測驗結束時,Orchestrator 等待所有非同步任務完成,聚合數據後執行 Transformation Agent

**效能提升**: 傳統 REST 同步模式每題等待 1-3 秒分析,10 題累積 10-30 秒延遲;WebSocket 非同步模式分析在背景執行,玩家感受零延遲。

### 4. 錯誤處理與重連

- **連線逾時**: 30 分鐘無互動自動斷線
- **斷線重連**: 前端可使用相同 sessionId 重新連線,後端從資料庫恢復狀態
- **分析失敗**: 單次分析失敗不影響測驗進行,系統會記錄錯誤並在最終結算時處理

---

## 六、RPG 整合架構與映射邏輯

### 1. 靈魂構造映射規則

系統嚴格執行以下跨工具映射，**AI 不得自行調整映射欄位**：

| 分析工具      | 映射 RPG 要素     | 詳細邏輯                                     |
| ------------- | ----------------- | -------------------------------------------- |
| **Enneagram** | 種族 (Race)       | 九型人格中心 → 種族。影響 MP 回復效率        |
| **MBTI**      | 核心職業 (Class)  | 16 型人格 → 職業原型。定義角色外觀與決策邏輯 |
| **Big Five**  | 屬性數值 (Stats)  | O→ 智力, C→ 防禦, E→ 速度, A→ 魅力, N→ 洞察  |
| **DISC**      | 對戰方式 (Stance) | 行為風格 → 戰鬥動作描述（攻、援、守、算）    |
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
