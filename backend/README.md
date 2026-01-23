# TraitQuest 後端守則：靈魂核心邏輯

本目錄為 **TraitQuest** 的魔導運算中樞，負責處理心理學模型映射、多代理 (Multi-Agent) 協作以及玩家數據的持久化。

## 🧠 核心邏輯

後端核心嚴格執行《TraitQuest 開發憲章》中的「五層映射系統」：

- **Enneagram** ➔ 種族 (Race)
- **MBTI** ➔ 核心職業 (Class)
- **Big Five** ➔ 基礎屬性 (Stats)
- **DISC** ➔ 對戰風格 (Stance)
- **Gallup** ➔ 傳奇技能 (Talent)

## 🛠 技術祭壇 (Tech Stack)

- **核心框架**: FastAPI (Python)
- **套件管理**: UV (高效能依賴管理)
- **代理開發**: GitHub Copilot SDK
- **身份驗證**: Google OAuth (唯一支持)
- **資料庫**:
  - PostgreSQL + JSONB (主資料結構)
  - Redis (對話 Session 緩存，TTL 30min)
- **模型調用**: LiteLLM (串接 GitHub Copilot 之 AI 模型)

## 📜 冒險準備 (Setup)

### 啟動儀式

1. **環境配置**:
   複製 `.env.example` 並設定 `DATABASE_URL` 與 `LITELLM_URL`。

2. **注入依賴**:

   ```bash
   uv sync
   ```

3. **啟動運算核**:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

### Docker 容器化
若需在隔離環境中運行：
```bash
# 確保已設置 GITHUB_COPILOT_TOKEN
export GITHUB_COPILOT_TOKEN="your_token_here"
./scripts/docker-run.sh up
```

## 📂 卷軸目錄 (Folder Structure)

- `app/api`: 魔導介面 (Endpoints)
- `app/agents`: 多代理系統 (Questionnaire, Analytics, Summary, Transformation, Validator)
- `app/db`: 記憶體持久化 (PostgreSQL Models & session)
- `app/core`: 核心法理 (Security, Config)
- `migrations`: 世界線變更紀錄 (SQL Scripts)

## ⚖️ 開發禁律

- ❌ 嚴禁對大型 JSONB 欄位進行全量 GIN 索引。
- ❌ 嚴禁自行維護密碼雜湊，僅支持 Google OAuth。
- ✅ 所有由 AI 生成的 ID 必須通過 `Validator Agent` 校對。
- ✅ 生成文件與註釋必須使用 **正體中文**。

---

**紀錄靈魂的本質，揭示隱藏的命運。**
