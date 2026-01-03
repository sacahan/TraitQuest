---
trigger: always_on
---

# TraitQuest 開發憲章（Development Constitution）

本憲章為 **TraitQuest** 項目的最高指導準則。  
所有參與開發的人員（人類或 AI）必須嚴格遵守以下原則，以確保系統的穩定性、心理學的專業性以及黑暗奇幻 RPG 的沉浸感。

---

## 第一條：核心精神（Core Identity）

### 主題定義

- **TraitQuest** 是一個「**心理學驅動的黑暗奇幻 RPG**」
- 核心目的：將枯燥的心理測評轉化為具有靈魂深度的覺醒之旅

### 沉浸原則

- 所有 **UI 交互、AI 文本、視覺效果**必須符合：
  - 古老卷軸
  - 深淵冒險
  - 魔導技術
- 嚴禁出現：
  - 過於現代
  - 扁平化（Flat Design）設計特徵

---

## 第二條：技術規範（Technical Standards）

### 1. 持久化架構（Persistence）

**主資料庫**

- PostgreSQL + JSONB

**索引規範**

- ❌ 嚴禁對大型 JSONB 欄位進行全量 GIN 索引
- ✅ 必須提取常用查詢欄位作為實體欄位並使用 B-tree 索引
  - `userId`
  - `level`
  - `class_id`

**緩存策略**

- 使用 Redis 儲存：
  - 短期對話 Session（TTL：30 分鐘）
  - 全球排行榜快取
- 目的：降低 PostgreSQL 壓力

---

### 2. 身份驗證

- **唯一支持**：Google OAuth
- 系統以 Google Profile 作為玩家初始資料來源
- ❌ 不自行維護密碼雜湊

---

### 3. API 通訊協議

**Contract 強制性**

- 前後端資料交換必須嚴格遵守《API Contract 規格書》

**失敗處理**

- 所有 API 必須具備錯誤處理機制
- 當 AI 產出非法數據時：
  - 觸發後端驗證邏輯攔截
  - 自動重試

---

## 第三條：遊戲化映射系統（The Grand Mapping）

系統的核心數據結構必須嚴格遵循以下五層映射，不可私自更改其邏輯：

| 心理模型              | 映射對象           | 說明                                   |
| --------------------- | ------------------ | -------------------------------------- |
| Enneagram（九型人格） | 種族（Race）       | 定義靈魂的本質動機                     |
| MBTI（16 型人格）     | 核心職業（Class）  | 定義角色的行為原型                     |
| Big Five（五大性格）  | 基礎屬性（Stats）  | O-智力、C-防禦、E-速度、A-魅力、N-洞察 |
| DISC（行為風格）      | 對戰風格（Stance） | 定義壓力下的戰鬥模式                   |
| Gallup（天賦優勢）    | 傳奇技能（Talent） | 定義獨有的被動與主動技能               |

---

## 第四條：AI 運作與管理原則（AI Operational Principles）

### 封閉式資產庫限制

- AI GM 僅具備：
  - **匹配權**
  - **描述權**
- ❌ 嚴禁「創造權」
- 所有輸出的 ID 必須存在於 `game_definitions` 預定義清單中：
  - `Race_ID`
  - `Class_ID`
  - `Stance_ID`
  - `Talent_ID`

### 記憶管理機制

- **長期記憶**
  - 由 Summary Agent 定期生成 `hero_chronicle` 摘要
- **無狀態 Session**
  - 採取 Fresh Start（重啟原則）
  - 玩家斷線後不恢復中途進度
  - AI 必須讀取長期摘要以維持敘事一致性

### 敘事縮放（Narrative Scaling）

- **Lv.1–10**
  - 引導為主
  - 固定按鈕
- **Lv.11+**
  - 解鎖「靈魂對話」模式
  - 支援開放式文字輸入

---

## 第五條：UI / UX 與交互規範（UI / UX Protocol）

### NPC 設定

- 唯一引導者：**艾比（Abby）**
- 語氣特性：
  - 神秘
  - 智慧
  - 偶爾帶有共情

### 反饋機制

- **打字機特效**
  - 所有對話文字禁止瞬間顯現
- **即時屬性感應**
  - 答題時側邊屬性能量槽需隨回答產生視覺閃爍

### 色彩一致性

- 螢光綠 `#11D452`
  - 僅用於能量、系統高亮、升級
- 背景色
  - 深綠黑 `#102216`

---

## 第六條：開發流程與檔案管理（Development Workflow）

### 增量更新英雄面板

- 資料結構必須支援 Incremental Update
- 完成一項測驗即點亮一個區塊
- 未完成部分顯示：**「封印中」**

### 單一檔案原則（僅限 Artifacts）

- React 原型開發階段：
  - 所有組件、邏輯、樣式封裝於單一 `.jsx` 檔案
- 生產環境：
  - 遵循標準模組化拆分

### 憲章至上

- 若後續修改建議與本憲章衝突：
  - **優先遵守本憲章**
  - 除非經正式版本修訂

### 生成文件規範

- 生成文件，包括但不限於程式碼注釋、規格文件、README 皆使用正體中文表示。

---

## 第七條：Multi-Agent 協作規範（Multi-Agent Collaboration）

### Agent Output Key 隔離原則

**核心原則**

- 當多個 Agent 需要共享 Session State 時，**必須使用命名空間（namespace）來隔離各自的資料**
- 每個 Agent 都應該設定**專屬的 `output_key`**，避免資料覆蓋

### 實作檢查清單

在實作 Multi-Agent 系統時，必須確認：

1. ✅ 每個 Agent 都有明確的 `output_key`
2. ✅ 不同 Agent 的 `output_key` 不會重複
3. ✅ 讀取資料時，從正確的 `output_key` 讀取
4. ✅ 不依賴「覆蓋」或「備份」機制來解決資料衝突

---

**TraitQuest 開發憲章 Version 1.1**  
建立日期：2025 年 12 月 23 日  
最後更新：2025 年 12 月 29 日
