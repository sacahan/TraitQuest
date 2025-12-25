# AGENTS.md - TraitQuest 專案開發總覽

## 1. 專案簡介 (Project Introduction)

**TraitQuest** 是一個將**深層心理學分析**與**黑暗奇幻 RPG (Dark Fantasy RPG)** 體驗深度結合的創新平台。本專案的核心目標是將枯燥的心理測評（MBTI, Big Five, DISC, Enneagram, Gallup）轉化為一場具有靈魂深度的覺醒之旅。

透過 AI Game Master (GM) 的敘事引導，玩家的心理特質將被映射為獨特的冒險角色，在探索自我的同時，也能與其他玩家的靈魂角色互動。

---

## 2. 開發憲章 (Development Constitution)

本專案遵循《TraitQuest 開發憲章》作為最高指導準則，所有開發者（人類或 AI）務必嚴格遵守。

### 核心精神

- **主題**：心理學驅動的黑暗奇幻 RPG。
- **視覺**：古老卷軸、深淵冒險、魔導技術。**嚴禁**使用現代、扁平化設計 (Flat Design)。
- **交互**：打字機特效敘事、即時屬性感應、沉浸式體驗。

### 技術鐵律

- **資料庫**：PostgreSQL (主要) + Redis (緩存)。
- **索引**：禁止對大型 JSONB 欄位全量索引，必須提取常用查詢欄位 (Functional Index)。
- **驗證**：唯一支持 Google OAuth。
- **AI 權限**：AI GM 僅有「匹配權」與「描述權」，**嚴禁**「創造權」。所有資產 ID 必須來自預定義清單。

---

## 3. 系統架構 (System Architecture)

### 3.1 前端 (Frontend)

- **風格**：黑暗奇幻、擬物化 (Skeuomorphism)。
- **配色**：
  - 背景：深綠黑 `#102216`
  - 主色：螢光綠 `#11D452` (能量、高亮)
  - 輔助：古金 `#D4AF37` (邊框、稀有度)

### 3.2 後端 (Backend)

- **API**：RESTful API (詳細定義於 `spec/contract.md`)。
- **持久化**：
  - `users`: 玩家基本資料。
  - `traits`: 英雄面板與心理分析結果 (Incremental Update)。
  - `user_quests`: 測驗歷程記錄。
  - `game_definitions`: 唯讀的預定義資產庫。

### 3.3 多代理系統 (Multi-Agent System)

系統由 Orchestrator 統籌多個 AI Agent 協作：

- **Summary Agent (史官)**：壓縮長期記憶 (`hero_chronicle`)。
- **Questionnaire Agent (說書人)**：生成 RPG 劇情包裝的題目。
- **Analytics Agent (分析官)**：解析回答，提取心理標籤。
- **Result Analysis Agent (AI Master)**：將標籤映射為遊戲資產 (Race, Class 等)。
- **Validator Agent (守望者)**：確保輸出的 ID 符合規範。

> Agent Prompt 可見 [templates](spec/templates.md)。

---

## 4. 遊戲化映射系統 (The Grand Mapping)

本專案的核心數據結構，不可隨意更改：

| 心理模型 (Source)        | 映射 RPG 要素 (Target) | 說明                                        |
| :----------------------- | :--------------------- | :------------------------------------------ |
| **Enneagram (九型人格)** | **種族 (Race)**        | 定義靈魂本質與動機 (如：鐵律族、聖靈族)     |
| **MBTI (16 型人格)**     | **核心職業 (Class)**   | 定義行為原型 (如：深淵謀略家、流浪詩人)     |
| **Big Five (五大性格)**  | **基礎屬性 (Stats)**   | O(智力), C(防禦), E(速度), A(魅力), N(洞察) |
| **DISC (行為風格)**      | **戰略姿態 (Stance)**  | 定義戰鬥模式 (攻、援、守、算)               |
| **Gallup (天賦優勢)**    | **傳奇技能 (Talent)**  | 定義主/被動技能                             |

> **注意**：詳細 ID 對照表請參閱 [assets](spec/assets.md)。

---

## 5. API 協議摘要 (API Contract)

詳細規格請參閱 [contract](spec/contract.md)。

- **Session 策略**：採取 **Fresh Start**。斷線不恢復當前進度，需重新挑戰副本。
- **主要 Endpoints**：
  - `POST /v1/auth/login`: Google 登入。
  - `POST /v1/quests/interact`: 提交回答（支援量化按鈕與開放式文字）。
  - `GET /v1/quests/{sessionId}/result`: 獲取英雄面板結果。

---

## 6. 專案目錄結構 (Project Structure)

```
TraitQuest/
├── .agent/
│   └── rules/
│       └── development-constitution.md  # 開發憲章 (最高準則)
├── spec/                                # 技術規格文檔
│   ├── spec.md                          # 系統需求說明書
│   ├── contract.md                      # API 用戶端協議
│   └── assets.md                        # 遊戲資產庫 (ID 對照表)
├── traitquest/                          # 核心介面與原型 (原 demo)
│   ├── index/                           # 首頁
│   ├── enneagram/                       # 九型人格介紹
│   ├── mbti/                            # MBTI 介紹
│   ├── big_five/                        # Big Five 介紹
│   ├── disc/                            # DISC 介紹
│   ├── gallup/                          # Gallup 介紹
│   ├── questionnaire/                   # 測驗互動頁面
│   ├── analysis/                        # 個人化結果分析
│   ├── map/                             # 心靈大陸世界地圖
│   └── bulletin_board/                  # 公會佈告欄
├── src/                                 # 源代碼 (待開發)
└── AGENTS.md                            # 本文件 (專案總覽)
```

---

## 7. 目前進度 (Current Status)

目前專案處於 **原型設計優化與開發準備階段**。

- **規格文檔 (Spec)**：已完成 V1.0 - V1.2 版 (`spec/`)。
- **介面原型 (UI Prototype)**：
  - 已將 `demo` 目錄遷移至 `traitquest` 並完成目錄結構標準化。
  - **完成全頁面 UI 標準化**：所有頁面已統一採用一致的 Tailwind 配置、Header/Footer 組件與黑暗奇幻風格。
  - 核心互動流（首頁 -> 介紹 -> 問卷 -> 結果）已具備完整的視覺體現。

---

## 8. 開發者注意事項 (Developer Notes)

1.  **修改規格**：若需修改資料結構或 API，請優先更新 `spec/` 下的對應文檔。
2.  **資產引用**：在編寫程式碼或生成資料時，務必參考 `spec/assets.md` 中的預定義 ID，**不可憑空捏造 ID**。
3.  **多語言**：所有文檔與輸出預設使用 **正體中文 (Traditional Chinese)**。
