AGENTS.md — TraitQuest Agent Playbook (約 150 行)

目標：讓 AI 代理快速上手並遵守本庫規範。涵蓋建置/測試指令、程式風格、錯誤處理、命名慣例、代理與 UI/敘事禁律。若有疑問，優先遵守《開發憲章》與本文規範。

==============================================================================
0) 必讀憲章與規則來源
------------------------------------------------------------------------------
- 開發憲章（最高準則）: .agent/rules/development-constitution.md
- 現有文件：README.md（root）、frontend/README.md、backend/README.md
- 無 Cursor/Copilot 規則檔（未發現 .cursor/rules、.cursorrules、.github/copilot-instructions.md）。

==============================================================================
1) 專案結構速覽
------------------------------------------------------------------------------
- frontend/ : React 19 + Vite + TS, Tailwind 4, Zustand, axios, Chart.js, Framer Motion.
- backend/  : FastAPI (Python 3.11+), SQLAlchemy async, Redis, PostgreSQL, LiteLLM, Google OAuth / GitHub Copilot SDK。
- spec/     : 規格與資產對照 (assets, contract, templates)。
- tests/    : frontend/tests (Playwright)、backend/tests (pytest)。

==============================================================================
2) 環境與變數 (關鍵)
------------------------------------------------------------------------------
- 前端環境變數 (Docker/build-docker.sh 需求)：
  - VITE_API_BASE_URL, VITE_WS_BASE_URL（協議匹配 http↔ws, https↔wss）
  - VITE_GOOGLE_CLIENT_ID
- 後端：.env（DATABASE_URL, LITELLM_URL 等）。
- 嚴禁自創資產 ID；所有 ID 需出自 spec/assets.md 真值表。

==============================================================================
3) 安裝 / Build / Lint / Test 指令
------------------------------------------------------------------------------
前端 (frontend/)
- 安裝：npm install
- 開發伺服：npm run dev
- 構建：npm run build  (tsc -b && vite build)
- Lint：npm run lint   (eslint .)
- E2E/Playwright：npx playwright test
- 單測/單檔：
  - Playwright 單測：npx playwright test frontend/tests/quest-completion.spec.ts
  - 以關鍵字：npx playwright test --grep "Quest Completion"

後端 (backend/)
- 安裝：uv sync
- 開發伺服：uv run uvicorn app.main:app --reload
- 測試：pytest
- 單測：pytest backend/tests/agents/test_validator.py -k verify_ids
- Docker 啟動：./scripts/docker-run.sh up (需設置 GITHUB_COPILOT_TOKEN)
- 注意 Copilot SDK 在測試中以 mock 方式處理（見 tests/conftest.py）。

共通
- 無 Makefile；無 monorepo 根級指令。於對應子目錄執行。

==============================================================================
4) TypeScript / 前端程式風格
------------------------------------------------------------------------------
- TS 5.9，ESNext modules，target ES2022。strict 開啟，noUnusedLocals/Parameters。
- tsconfig: bundler moduleResolution, verbatimModuleSyntax, allowImportingTsExtensions, jsx: react-jsx, no emit。
- ESLint (frontend/eslint.config.js): js+ts recommended, react-hooks recommended, react-refresh vite, globals.browser。
- 格式化：未見 Prettier/biome；沿用專案現有風格與縮排（2 空格）。
- Imports：使用 ESNext/絕對不隱式 any；保留擴展名由 bundler 處理；遵守 moduleDetection: force。
- 命名：camelCase 函式/變數，PascalCase component/class，UPPER_SNAKE_CASE 常數。
- 型別：避免 any；勿用 @ts-ignore/@ts-expect-error；hooks/props/state 全數標型別。
- React：使用函式元件 + hooks；lazy + Suspense；路由使用 react-router-dom v6；狀態以 Zustand。
- 狀態：authStore/questStore/mapStore；localStorage 儲存 token；axios 拦截器自動附帶 Authorization。
- 風格/敘事：必須符合「黑暗奇幻 + 古老卷軸 + 魔導技術」，禁止扁平化設計；打字機效果、即時屬性感應需保留。
- 視覺改動：若需純樣式/佈局/動效，委派前端 UI/UX 專員；本文件僅述規範。

==============================================================================
5) Python / 後端程式風格
------------------------------------------------------------------------------
- Python 3.11+；FastAPI；SQLAlchemy async；Redis；JWT；pydantic v2。
- 型別：遵循 PEP8、4-space、行長 ≤180；公有函式/類/模組寫 docstring；函式/方法全數型別標註。
- 配置：依 .env (pydantic-settings)；核心設定在 app/core/config.py。
- Logging：app/core/logging_config.configure_logging；主 logger "app"；請沿用。
- 安全：唯一登入流程為 Google OAuth；verify_google_token + create_access_token；decode_access_token 驗證。
- DB：PostgreSQL；禁止對大型 JSONB 全量索引；需 functional/B-tree；Redis 用於 session/leaderboard。
- 例外處理：FastAPI 全域 exception handlers 已定義（ValidationError, ResponseValidationError, global）。新增 handler 時務必回傳 JSON 結構；避免吞例外。
- 測試：pytest；可用 uv run pytest；單測 -k；避免重寫業務邏輯於測試；僅 mock 外部依賴 (Copilot SDK, I/O)。

==============================================================================
6) 開發憲章強制條款（節選，務必遵守）
------------------------------------------------------------------------------
- 主題/視覺：黑暗奇幻、古老卷軸、深淵冒險、魔導技術；嚴禁扁平化。
- 身份驗證：僅支援 Google OAuth；不得自建密碼流。
- 資產 ID：AI 僅有匹配權/描述權，無創造權；ID 必須來自預定義清單。
- Session 策略：Fresh Start；斷線不恢復；長期記憶由 Summary Agent 維護 hero_chronicle。
- 大型 JSONB：禁全量 GIN；需抽取常用欄位建索引。
- 生成文本/文件：預設使用正體中文。
- 多 Agent：必須為各 Agent 設定獨立 output_key；避免覆蓋。
- UI 互動：打字機效果；答題時側邊屬性能量槽需有即時視覺回饋。

==============================================================================
7) 代理/多代理實作提醒
------------------------------------------------------------------------------
- output_key/namespace 必須分離，避免覆蓋。
- Validator Agent：負責校驗 AI 產出 ID 是否存在真值清單；發現幻覺需重試。
- Summary Agent：定期 10 輪或測驗結束更新 hero_chronicle。
- Transformation/Analytics/Questionnaire Agents：遵守映射五層結構。

==============================================================================
8) 命名、錯誤處理與日誌
------------------------------------------------------------------------------
- 命名：snake_case (Python 函式/變數)、PascalCase (類)、UPPER_SNAKE_CASE (常數)。TS 採 camelCase/ PascalCase。
- 錯誤處理：後端 API 回傳 JSON；避免裸 except；記錄 stack trace（已在全域 handler）。
- 日誌：使用 app logger；關鍵啟動/連線檢查已在 lifespan；新增日誌請保持語系一致（中文描述）。

==============================================================================
9) 測試策略與案例
------------------------------------------------------------------------------
- 後端：pytest；mock 外部（Copilot SDK、外部 I/O）；勿重寫業務邏輯；測試驗證實際訊息格式。
- 前端：Playwright 端對端；可使用 route.fulfill mock API；在 beforeEach 設置 localStorage token。
- 單測指令示例：
  - 後端單案例：uv run pytest backend/tests/agents/test_validator.py -k verify_ids_with_valid_ids
  - 前端單 spec：npx playwright test frontend/tests/mobile-navigation.spec.ts --headed

==============================================================================
10) API/通訊要點
------------------------------------------------------------------------------
- 前端 axios 攔截器自動附帶 Bearer token；401 會觸發 logout 並重導首頁。
- WebSocket：VITE_WS_BASE_URL (wss/http 對應)；quest_ws.py 為入口。
- CORS：後端 CORSMiddleware 已設 allow_credentials=True；origins 由環境設定。

==============================================================================
11) 前端 UI/UX 禁忌與義務
------------------------------------------------------------------------------
- 保持打字機效果、霧化/光暈、深色系；色彩：背景 #102216，主色 #11D452，輔助 #D4AF37。
- 保留即時屬性感應（回答時能量槽閃爍）。
- 視覺調整請交由 UI/UX 專員；若需業務邏輯變更可自行處理。

==============================================================================
12) 安全與資料約束
------------------------------------------------------------------------------
- 不得記錄或回傳敏感憑證；token 僅存 localStorage。
- Hero/Quest 資料需符合映射：Enneagram→Race，MBTI→Class，Big Five→Stats，DISC→Stance，Gallup→Talent。
- Fresh Start：斷線不恢復，重新挑戰；長期摘要供敘事一致性。

==============================================================================
13) 產出語言與文件
------------------------------------------------------------------------------
- 代碼註解、文件、輸出預設使用正體中文。
- 新文件/更新 README 時需同步反映變更。

==============================================================================
14) 快速檢查清單 (供代理執行任務前自檢)
------------------------------------------------------------------------------
[] 確認所需環境變數與資產 ID 來源 (spec/assets.md)
[] 前端改動：遵循暗黑奇幻風格，避免扁平化；視覺改動委派 UI/UX 專員
[] 後端改動：遵守憲章限制（OAuth 單一來源、JSONB 索引禁令）
[] 型別安全：不得使用 any/@ts-ignore；Python 函式需型別與 docstring
[] 測試：至少跑相關 pytest 或 Playwright；單檔指令可用 -k / --grep
[] 日誌/錯誤：使用統一 logger，回傳 JSON，避免裸 except
[] 多 Agent：output_key 隔離，Validator 校驗 ID
[] 文件：必要時更新 README/本 AGENTS.md

==============================================================================
15) 常用指令備忘 (複製即用)
------------------------------------------------------------------------------
- 前端開發：cd frontend && npm run dev
- 前端建置：cd frontend && npm run build
- 前端 Lint：cd frontend && npm run lint
- 前端單測 (Playwright)：cd frontend && npx playwright test --grep "Quest"
- 後端開發：cd backend && uv run uvicorn app.main:app --reload
- 後端測試：cd backend && uv run pytest -k validator
- 後端單檔：cd backend && uv run pytest backend/tests/api/test_map.py

==============================================================================
16) 如需新規範
------------------------------------------------------------------------------
- 若新增規則與《開發憲章》衝突，需先修訂憲章；否則以憲章為準。
- 文檔預設中文；保持與現有語氣一致（黑暗奇幻、魔導科技）。

==============================================================================
（完）
