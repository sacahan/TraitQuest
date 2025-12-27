# TraitQuest：API Contract 技術規格書

**版本**: V1.2  
**最後更新**: 2025-12-23

---

## 📋 文件說明

本文件詳述 **TraitQuest** 平台前後端資料交換的 API 規範。根據 V5.8 技術規格，系統採用「**無狀態 Session**」與「**增量英雄面板**」機制。所有 AI 敘事皆由 NPC **艾比 (Abby)** 引導。

---

## 0. 全域規範 (Global Specifications)

### 基本設定

| 項目               | 規範                                      |
| ------------------ | ----------------------------------------- |
| **Base URL**       | `https://api.traitquest.com/v1`           |
| **Content-Type**   | `application/json`                        |
| **Authentication** | `Authorization: Bearer <Google_ID_Token>` |

### Session Policy

⚠️ **採取 Fresh Start 策略**

中斷 Session（如重整網頁）將導致進度遺失需重新開始，但 AI 會讀取長期摘要維持敘事連貫性。

---

## 1. 身份驗證模組 (Authentication)

### 1.1 Google 登入與資料同步

**Endpoint**: `POST /auth/login`

**描述**: 驗證 Google Token 並返回玩家基礎進度。

#### Request Body

```json
{
  "token": "string"
}
```

#### Success Response (200)

```json
{
  "userId": "uuid",
  "displayName": "string",
  "avatarUrl": "url",
  "level": 1,
  "exp": 100,
  "isNewUser": true,
  "currentHeroState": "INIT|RACE_AWAKENED|CLASS_UNLOCKED|COMPLETE"
}
```

---

## 2. 冒險任務模組 (Quest & AI GM)

### 2.1 連線建立 (WebSocket Connection)

**WebSocket URL**: `ws://[host]/v1/quests/ws`

**Query Parameters**:
- `sessionId`: UUID (測驗 Session 識別碼)
- `token`: JWT Token (從登入 API 取得)

**連線流程**:

1. 前端透過 `POST /auth/login` 取得 JWT Token
2. 前端發起 WebSocket 連線: `ws://api.traitquest.com/v1/quests/ws?sessionId={uuid}&token={jwt}`
3. 後端驗證 token,建立連線並綁定 sessionId
4. 連線建立成功後,後端自動推送第一題
5. 測驗結束或連線逾時(30 分鐘無互動)後自動關閉

**連線狀態碼**:

| 狀態碼 | 說明                     |
| ------ | ------------------------ |
| 1000   | 正常關閉(測驗完成)       |
| 1008   | Token 驗證失敗           |
| 1011   | 伺服器內部錯誤           |
| 4001   | Session 不存在或已過期   |

---

### 2.2 Client → Server 事件

#### 事件: `start_quest`

**描述**: 啟動副本試煉,獲取艾比的第一段敘事與第一題

**Payload**:

```json
{
  "event": "start_quest",
  "data": {
    "questId": "mbti|big5|disc|enneagram|gallup"
  }
}
```

**Server 回應**: 發送 `first_question` 事件

---

#### 事件: `submit_answer`

**描述**: 提交玩家回答

**Payload**:

```json
{
  "event": "submit_answer",
  "data": {
    "answer": "string", // 選項文字或玩家自定義敘述
    "questionIndex": 1  // 當前題號 (1-based)
  }
}
```

**Server 回應**: 
- 立即發送 `next_question` 事件 (非阻塞)
- 後台執行 Analytics Agent 分析
- (可選) 發送 `analysis_progress` 事件

---

#### 事件: `request_result`

**描述**: 請求最終分析結果 (測驗完成後)

**Payload**:

```json
{
  "event": "request_result",
  "data": {}
}
```

**Server 回應**: 
- 等待所有非同步分析任務完成
- 發送 `final_result` 事件

---

### 2.3 Server → Client 事件

#### 事件: `first_question`

**描述**: 副本啟動後的第一題

**Payload**:

```json
{
  "event": "first_question",
  "data": {
    "narrative": "艾比 (Abby) 的副本引導文字...",
    "question": {
      "id": "q1",
      "type": "QUANTITATIVE", // QUANTITATIVE (按鈕) 或 SOUL_NARRATIVE (文字輸入)
      "category": "Spirit Resonance Check", // 題目分類標題
      "text": "情境題目內容...",
      "options": ["選項 A", "選項 B"] // 若為 SOUL_NARRATIVE 則為空陣列
    }
  }
}
```

---

#### 事件: `next_question`

**描述**: 玩家提交答案後的下一題 (立即推送,不等待分析完成)

**Payload**:

```json
{
  "event": "next_question",
  "data": {
    "questionIndex": 2,
    "narrative": "艾比對玩家抉擇的劇情回饋...",
    "question": {
      "type": "QUANTITATIVE|SOUL_NARRATIVE",
      "category": "Moral Compass Test",
      "text": "下一題內容...",
      "options": ["...", "..."]
    },
    "expGained": 15,
    "visualFeedback": "GLOW_EFFECT" // 用於觸發高品質回答的符文發光特效
  }
}
```

**Visual Feedback 類型**:

| Feedback      | 觸發條件   | 視覺效果     |
| ------------- | ---------- | ------------ |
| `GLOW_EFFECT` | 高品質回答 | 符文發光特效 |
| `NORMAL`      | 一般回答   | 無特殊效果   |

---

#### 事件: `analysis_progress` (可選)

**描述**: 後台分析進度通知

**Payload**:

```json
{
  "event": "analysis_progress",
  "data": {
    "questionIndex": 1,
    "status": "analyzing|completed|failed",
    "progress": 0.8 // 0.0 ~ 1.0
  }
}
```

---

#### 事件: `quest_complete`

**描述**: 測驗完成通知

**Payload**:

```json
{
  "event": "quest_complete",
  "data": {
    "message": "測驗完成,正在生成你的英雄面板...",
    "totalExp": 150,
    "questionsCompleted": 10
  }
}
```

---

#### 事件: `final_result`

**描述**: 最終分析結果 (等待所有非同步任務完成後推送)

**Payload**: 與 `GET /quests/{sessionId}/result` 相同的 JSON 結構 (見第 3 節)

```json
{
  "event": "final_result",
  "data": {
    "profile": { ... },
    "modules": { ... },
    "stats": { ... },
    "combat": { ... },
    "skills": { ... },
    "destinyBonds": { ... },
    "destinyGuide": { ... }
  }
}
```

---

#### 事件: `error`

**描述**: 錯誤通知

**Payload**:

```json
{
  "event": "error",
  "data": {
    "code": "ANALYSIS_TIMEOUT|VALIDATION_FAILED|AGENT_ERROR|...",
    "message": "錯誤描述",
    "details": "詳細資訊 (可選)",
    "recoverable": true // 是否可重試
  }
}
```

**錯誤碼說明**:

| 錯誤碼               | 說明                         | 前端處理建議       |
| -------------------- | ---------------------------- | ------------------ |
| `ANALYSIS_TIMEOUT`   | 單次分析超時 (30秒)          | 顯示警告,繼續測驗  |
| `VALIDATION_FAILED`  | AI 生成結果驗證失敗          | 自動重試           |
| `AGENT_ERROR`        | Agent 執行錯誤               | 顯示錯誤訊息       |
| `SESSION_EXPIRED`    | Session 已過期               | 引導重新開始測驗   |
| `LEVEL_INSUFFICIENT` | 等級不足無法進入該據點       | 顯示等級需求提示   |

---

### 2.4 非同步分析機制

**核心優化**: 玩家提交答案後,系統採用非阻塞式處理流程:

1. **立即回應**: Orchestrator 調用 Questionnaire Agent 生成下一題,透過 `next_question` 事件立即推送給前端
2. **後台分析**: 同時啟動 Analytics Agent 非同步任務,分析玩家回答並寫入資料庫
3. **進度通知** (可選): 分析完成後發送 `analysis_progress` 事件
4. **最終聚合**: 測驗結束時,Orchestrator 等待所有非同步任務完成,聚合數據後執行 Transformation Agent

**時序圖**:

```
玩家提交答案 (submit_answer)
    ↓
Orchestrator 接收
    ↓
    ├─→ [同步] Questionnaire Agent 生成下一題 → 立即推送 next_question
    └─→ [非同步] Analytics Agent 分析 → 寫入 DB → (可選) 推送 analysis_progress
    
測驗完成 (quest_complete)
    ↓
等待所有非同步任務完成 (asyncio.gather)
    ↓
聚合數據 → Transformation Agent → Validator Agent
    ↓
推送 final_result
```

**效能提升**:
- 傳統 REST 同步模式: 每題等待 1-3 秒分析,10 題累積 10-30 秒延遲
- WebSocket 非同步模式: 分析在背景執行,玩家感受零延遲

---

### 2.5 斷線重連機制

**重連策略**:

1. 前端檢測到 WebSocket 斷線
2. 使用相同 `sessionId` 重新建立連線
3. 後端從資料庫恢復狀態:
   - 讀取 `user_quests.interactions` 取得已完成的題數
   - 推送當前應該顯示的題目
4. 繼續測驗流程

**狀態恢復範例**:

```json
{
  "event": "state_restored",
  "data": {
    "currentQuestionIndex": 5,
    "completedQuestions": 4,
    "question": { ... } // 當前題目
  }
}
```

---

## 3. 分析結果模組 (Result Analysis)

### 3.1 獲取英雄面板 (靈魂構造)

**Endpoint**: `GET /quests/{sessionId}/result`

**描述**: 獲取結構化 JSON 以渲染英雄面板，對應預定義資產庫 ID。

#### Success Response (200)

```json
{
  "profile": {
    "race_id": "RACE_5", // Enneagram 解鎖後
    "class_id": "CLS_INTJ", // MBTI 解鎖後
    "title": "永不妥協的領路人",
    "rarity": "SSR",
    "awakeningProgress": 65, // 百分比
    "manaCharge": 80 // 消耗/充能值
  },
  "modules": { // 五大系統解鎖狀態與基礎資料
    "mbti": { "isUnlocked": true, "code": "INTJ", "label": "深淵謀略家" },
    "big5": { "isUnlocked": true, "radar": [80, 70, 45, 30, 90] },
    "enneagram": { "isUnlocked": true, "code": "5w6", "label": "智者" },
    "disc": { "isUnlocked": false, "lockHint": "需前往戰鬥叢林進行試煉" },
    "gallup": { "isUnlocked": false, "lockHint": "等級需達到 Lv.10" }
  },
  "stats": {
    "radar": [
      { "stat": "INT (開放性)", "value": 95 },
      { "stat": "VIT (盡責性)", "value": 80 },
      { "stat": "AGI (外向性)", "value": 45 },
      { "stat": "CHA (親和性)", "value": 30 },
      { "stat": "DEX (神經質)", "value": 88 }
    ]
  },
  "combat": {
    "stance_id": "STN_C", // 星辰軌跡 (DISC)
    "style_desc": "在壓力下傾向收集數據而非盲目衝鋒。"
  },
  "skills": {
    "talent_ids": ["TAL_STR", "TAL_ANA"], // 技能 ID (Gallup)
    "descriptions": ["策略預判", "弱點分析"]
  },
  "destinyBonds": { // 命運羈絆
    "compatible": [
      {
        "name": "熱血激勵者",
        "class": "ENFP",
        "syncRate": 98,
        "description": "熱情能融化你冰冷的理性高牆。",
        "bonus": "全員士氣 +20%"
      }
    ],
    "conflicting": [
      {
        "name": "秩序執行官",
        "class": "ESTJ",
        "warning": "過於教條的執行力可能限制你的想像力。",
        "riskLevel": "HIGH"
      }
    ]
  },
  "destinyGuide": { // 命運指引結構化資料
    "daily": {
      "title": "今日預言：靜謐之時",
      "description": "星辰顯示今日不宜衝動，適合深思...",
      "reward": "Exp +50"
    },
    "main": {
      "title": "突破理性邊界",
      "description": "在下次測驗中嘗試使用直覺進行回答...",
      "progress": 33
    },
    "side": {
      "title": "靈魂共鳴",
      "description": "找一個安靜的角落...",
      "reward": "INT +2, WIS +1"
    },
    "oracle": {
      "title": "神諭：覺醒之兆",
      "description": "你體內的某種力量正在甦醒...",
      "status": "IMPORTANT"
    }
  }
}
```

#### 資料結構映射

| 欄位          | 來源      | 說明                |
| ------------- | --------- | ------------------- |
| `race_id`     | Enneagram | 九型人格 → 種族     |
| `class_id`    | MBTI      | 16 型人格 → 職業    |
| `stats.radar` | Big Five  | 五大性格 → 屬性數值 |
| `stance_id`   | DISC      | 行為風格 → 戰略姿態 |
| `talent_ids`  | Gallup    | 天賦優勢 → 技能樹   |

---

## 4. 錯誤處理 (Error Handling)

### HTTP 狀態碼說明

| 狀態碼  | 錯誤類型               | 說明                             | 前端處理建議           |
| ------- | ---------------------- | -------------------------------- | ---------------------- |
| **401** | `Unauthorized`         | Google Token 失效                | 引導重新登入           |
| **403** | `Forbidden`            | 等級不足無法進入該據點           | 顯示等級需求提示       |
| **410** | `Gone`                 | Session 已失效（如重連）         | 引導玩家重新進入副本   |
| **422** | `Unprocessable Entity` | AI 生成結果不符合預定義資產庫 ID | 自動重試或顯示錯誤訊息 |

### 錯誤回應格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": "詳細資訊（可選）"
  }
}
```

---

## 5. 地圖系統模組 (World Map)

### 5.1 獲取心靈大陸地圖狀態

**Endpoint**: `GET /map`

**描述**: 獲取所有區域的解鎖與完成狀態。

#### Success Response (200)

```json
{
  "regions": [
    {
      "id": "mbti",
      "name": "MBTI 聖殿",
      "status": "COMPLETED", // LOCKED | OPEN | COMPLETED
      "progress": 100
    },
    {
      "id": "big5",
      "name": "Big Five 屬性之泉",
      "status": "OPEN",
      "progress": 0
    },
    {
      "id": "gallup",
      "name": "Gallup 祭壇",
      "status": "LOCKED",
      "progress": 0,
      "unlockCondition": "需先完成 DISC 戰鬥叢林"
    }
  ]
}
```

---

**文件版本**: V1.3  
**維護者**: TraitQuest Development Team  
**最後更新**: 2025-12-26
