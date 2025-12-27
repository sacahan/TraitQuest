# TraitQuest 開發規格書 (Development Specification)

**版本**: 1.1 (Refined)
**日期**: 2025-12-26
**狀態**: 待審閱 (Pending Review)
**參考來源**: [prd.md](prd.md)、[database.md](database.md)、[assets.md](assets.md)、[contract.md](contract.md)、[development.md](development.md)、[template.md](template.md)、[development-constituent.md](../.agent/rules/development-constitution.md)。

---

## 1. 專案願景與目標 (Vision & Goals)

**TraitQuest** 旨在打造一個「沈浸式心理探索 RPG」。區別於傳統問卷網站，本專案必須讓使用者感覺自己進入了一個黑暗奇幻的異世界。每一個點擊、每一次輸入，都應獲得即時且具備「魔法感」的反饋。

**核心目標**：

1.  **深度敘事**：AI GM 艾比 (Abby) 的引導必須貫穿自始至終，非生硬的系統提示。
2.  **視覺衝擊**：嚴格遵守黑暗奇幻 (Dark Fantasy) 風格，拒絕現代扁平化設計。**必須完整保留並移植 `demo` 目錄中的視覺效果與動態細節**。
3.  **精準映射**：心理學模型 (MBTI/Big5 等) 與遊戲數值 (職業/屬性) 的映射必須精確且一致。參考 [assets.md](assets.md)。

---

## 2. 技術棧 (Tech Stack)

### 2.1 前端 (Frontend)

- **框架**: **Vite + React**
  - _重點_: 將 `demo/` 中的 HTML/CSS 完美轉換為 React Components，務必保留原有的 Tailwind 樣式、打字機特效、呼吸燈光效等細節。
- **狀態管理**: **Zustand**
  - _用途_: 管理全局 User Session、測驗進度、動畫觸發狀態。
- **樣式**: **Tailwind CSS** + **Framer Motion**
  - _用途_: 復刻原型的 CSS 效果並增強轉場動畫。
- **視覺庫**: Chart.js / Recharts (雷達圖)

### 2.2 後端 & AI (Backend & AI)

- **語言/框架**: **Python / FastAPI**
- **WebSocket 支援**: **FastAPI WebSocket** + **asyncio**
  - _用途_: 實現測驗互動的即時雙向通訊
  - _連線管理_: 使用 ConnectionManager 管理 WebSocket 連線池
- **非同步任務**: **asyncio.create_task** + **Redis Queue** (可選)
  - _用途_: Analytics Agent 的後台非同步分析
  - _保證機制_: 測驗結束時使用 `asyncio.gather` 等待所有任務完成
- **AI Orchestration**: **Agent Development Kit (ADK)**
  - _用途_: 構建與管理 Summary Agent, Questionnaire Agent 等多代理協作流程。
- **LLM 網關**: **LiteLLM**
  - _模型源_: 連接 **Github Copilot LLM Models**。
- **資料庫**: **PostgreSQL** (主資料庫, JSONB)
- **快取**: **Redis** (Session, Ranking, Task Queue)
- **Python package and project manager**: **[UV](https://docs.astral.sh/uv/)**

### 2.4 持久化與效能設計 (Persistence & Perf)

- **結果持久化 (Snapshotting)**：
  - 英雄在結算後生成的 Race_ID, Class_ID, Stats 等「靜態屬性」必須存入 `traits` 表。
  - 前端重複檢視英雄面板時，API 必須返回資料庫快照，嚴禁觸發 AI 重新生成。
- **Agent 成本優化**：
  - `Summary Agent` (史官) 更新頻率限制為每 10 輪對話一次,或其副本測驗結算時觸發。
- **Context 管理與一致性維護**：
  - **SessionId 索引**：每次 API 請求都透過 `sessionId` 從資料庫撈取歷史紀錄,確保 Orchestrator 能將完整 Context 注入到 Agent Prompt 中。
  - **Redis 短期快取**：緩存最後 3 輪對話,提升即時互動的反應速度。
  - **PostgreSQL 長期存儲**：`user_quests.interactions` (JSONB) 增量存儲每一輪的題目、回答與分析標籤。
  - **語義壓縮**：Summary Agent 將長期對話壓縮為 `hero_chronicle` 摘要,避免 Token 視窗溢出。
  - **數據聚合**:測驗結束時,Orchestrator 聚合所有 `trait_deltas` 增量,傳遞給 Transformation Agent 進行最終映射。
- **非同步分析保證**:
  - **即時回應**:玩家提交答案後,Questionnaire Agent 立即生成下一題並透過 WebSocket 推送
  - **後台分析**:Analytics Agent 作為非同步任務執行,分析結果寫入 `user_quests.interactions`
  - **完成等待**:測驗結束時,使用 `asyncio.gather` 等待所有非同步分析任務完成
  - **超時處理**:單個分析任務超時(30秒)視為失敗,記錄錯誤但不阻塞測驗進行

### 2.3 基礎設施與環境 (Infra & Env)

- **部署策略**: **Local First** (優先本地開發與部署)
- **環境變數**: 使用 `.env` 管理配置。

#### 環境變數配置

專案根目錄包含兩個環境變數檔案：
- `.env.example` - 範本檔案（可提交版本控制）
- `.env` - 實際配置（已加入 .gitignore，包含敏感資訊）

**主要環境變數**：

```bash
# Database Configuration
DATABASE_URL="postgresql+asyncpg://traitsuser:password@sacahan-ubunto:5432/traitquest"

# Redis Configuration
REDIS_HOST=sacahan-ubunto
REDIS_PORT=6379
REDIS_DB=5
REDIS_PASSWORD=your_redis_password

# LiteLLM Configuration
LITELLM_URL=http://localhost:4000
GITHUB_COPILOT_TOKEN=your_github_copilot_token

# Application Configuration
APP_ENV=development
SECRET_KEY=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

- **認證**: **Google OAuth**


---

## 3. 開發階段規劃 (Development Phases)

為降低複雜度與風險，將開發劃分為四個階段 (Phase)。

### Phase 1: 核心骨架 (MVP)

**目標**: 建立從登入、進行單一測試到查看基本結果的完整路徑。

- **Frontend**:
  - Initialize Vite + React + Zustand 專案。
  - 實作 `demo/index` 登入頁。
  - 實作 `demo/questionnaire` (支持 `QUANTITATIVE` 與 `SOUL_NARRATIVE`)，需保留 demo 中的打字機與發光特效。
  - 實作 `demo/analysis` 基礎版 (雷達圖、英雄面板)。
- **Backend**:
  - 實作 FastAPI + ADK 基礎架構。
  - Google OAuth 整合。
  - **資料結構**: 實作 [contract.md](contract.md) V1.3 定義的基礎 Profile 格式。
  - **LLM**: 實作單一 Agent (Questionnaire Agent) 進行出題與基礎分析，參考 [template.md](template.md)。
- **Database**: PostgreSQL 基礎表結構，參考 [database.md](database.md)。

### Phase 2: 全面遊戲化與多 Agent 協作

**目標**: 完整開放五大測驗與地圖系統，實作深度分析報告。

- **Frontend**:
  - 實作 `demo/map` 互動式世界地圖，需對接 `/map` API 渲染解鎖狀態。
  - **完善 Hero Panel 所有區塊**：
    - 實作解鎖/鎖定狀態卡片渲染。
    - 實作「命運指引」四類建議組件。
    - 實作「命運羈絆」相性建議與警戒組件。
  - **視覺反饋實作**：解析 `visualFeedback: "GLOW_EFFECT"` 並觸發對應的 CSS 圖騰發光特效。
- **Backend**:
  - 實作 Multi-Agent 系統 (Summary, Analytics, Transformation, Validator Agents)，參考 [template.md](template.md)。
  - **映射邏輯**: 完善 Enneagram -> Race, MBTI -> Class, Big Five -> Stats, DISC -> Stance, Gallup -> Talent 之映射，參考 [assets.md](assets.md)。
  - 實作 `/map` 區域解鎖邏輯。
- **Database**: 完善 `game_definitions` 與長期記憶存儲，參考 [database.md](database.md)。

### Phase 3: 視覺沈浸與體驗打磨 (Immersion & Polish)

**目標**: 優化動態體驗，確保 React 版本與 Demo 原型的互動感一致甚至更佳。

- **前端**:
  - **動效優化**: 使用 Framer Motion 強化 `demo` 原有的 CSS 動畫（如卡片脈衝、光效）。
  - **轉場**: 實作頁面間的無縫轉場。
  - **RWD**: 確保所有移植過來的組件在手機端表現正常。
- **後端**:
  - 優化 LiteLLM 呼叫延遲。
  - 調整 Redis 快取策略。

### Phase 4: 社群與擴充 (Social & Scale)

**目標**: 增加玩家互動與留存率。

- **功能**:
  - 實作公會佈告欄 (Bulletin Board)。
  - 實作排行榜與分享圖生成。
  - 準備部署至雲端環境的設定檔 (Dockerfile 等)。

---

## 4. 詳細功能規格 (Detailed Features)

### 4.1 冒險系統 (Quest System)

- **敘事引擎**: 透過 ADK 調用 LiteLLM Library 生成回應，參考 [using-cloud-proprietary-models-via-litellm](https://google.github.io/adk-docs/agents/models/#using-cloud-proprietary-models-via-litellm)。
- **容錯機制**: ADK 層需處理 LLM 格式錯誤重試。
- **本地開發**: 開發者需確保 LiteLLM Library 正常運作。

### 4.2 英雄面板 (Hero Profile)

- **動態雷達圖**: 使用 React 圖表庫重新實作 `demo/analysis` 中的圖表。
- **組件復用**: 將卡片、按鈕、對話框封裝為通用 React 組件。

### 4.3 後台與監控

- **ADK 監控**: 利用 ADK 內建工具或日誌監控 Agent 狀態。
- **資料庫管理**: 本地開發使用 Docker Compose 或直接安裝的 PGAdmin/DBeaver 管理數據。

---

## 5. 測試策略 (Testing Strategy)

- **單元測試**: 針對 ADK Agent 的邏輯進行測試。
- **整合測試**: 驗證 Local DB + API + LiteLLM 的完整鏈路。

---

## 6. 下一步 (Next Steps)

1.  確認此規格書 (v1.1) 無誤。
2.  初始化 Vite + React 專案。
3.  初始化 Python FastAPI 專案與 ADK 環境。
4.  開始 Phase 1 開發：移植首頁樣式與實作登入。
