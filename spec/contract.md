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

### 2.1 啟動副本試煉 (Fresh Start)

**Endpoint**: `POST /quests/{questId}/start`

**描述**: 重置臨時 Session 並獲取艾比的第一段敘事。

#### Success Response (200)

```json
{
  "sessionId": "uuid",
  "narrative": "艾比 (Abby) 的副本引導文字...",
  "firstQuestion": {
    "id": "q1",
    "type": "QUANTITATIVE", // QUANTITATIVE (按鈕) 或 SOUL_NARRATIVE (文字輸入)
    "text": "情境題目內容...",
    "options": ["選項 A", "選項 B"] // 若為 SOUL_NARRATIVE 則為空陣列
  }
}
```

#### Question Type 說明

| Type             | 說明                 | Options      |
| ---------------- | -------------------- | ------------ |
| `QUANTITATIVE`   | 量化試煉（按鈕選擇） | 包含選項陣列 |
| `SOUL_NARRATIVE` | 靈魂對話（文字輸入） | 空陣列 `[]`  |

---

### 2.2 提交回答並獲取下一題 (混合模式)

**Endpoint**: `POST /quests/interact`

#### Request Body

```json
{
  "sessionId": "uuid",
  "questId": "mbti|big5|disc|enneagram|gallup",
  "answer": "string" // 傳送選項文字或玩家自定義敘述
}
```

#### Success Response (200)

```json
{
  "isCompleted": false,
  "narrative": "艾比對玩家抉擇的劇情回饋...",
  "nextQuestion": {
    "type": "QUANTITATIVE|SOUL_NARRATIVE",
    "category": "Spirit Resonance Check", // 用於渲染題目上方的分類標題
    "text": "下一題內容...",
    "options": ["...", "..."]
  },
  "expGained": 15,
  "visualFeedback": "GLOW_EFFECT" // 用於觸發高品質回答的符文發光特效
}
```

#### Visual Feedback 類型

| Feedback      | 觸發條件   | 視覺效果     |
| ------------- | ---------- | ------------ |
| `GLOW_EFFECT` | 高品質回答 | 符文發光特效 |
| `NORMAL`      | 一般回答   | 無特殊效果   |

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
