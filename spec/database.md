# PostgreSQL JSONB 資料設計深度解析

**版本**: V1.0
**最後更新**: 2025-12-26

---

## 📋 文件說明

本文件詳述 TraitQuest 專案中 PostgreSQL 資料庫的設計哲學與 Schema 規範。系統大量使用 JSONB 格式，旨在支撐「增量英雄面板」的靈活性與半結構化數據的快速存取。

---

## 1. 核心資料表與 JSONB 應用

### 1.1 `traits` 表 (英雄面板核心)

此表為玩家的核心檔案，儲存從各類心理測驗轉化而來的遊戲化屬性。

- **`final_report` (JSONB)**：
  儲存結構化英雄屬性，包含種族、職業、雷達圖數值與已解鎖技能。

> **設計優勢**：
> 允許隨著不同心理測驗（MBTI, Big Five 等）的完成，逐步「增量更新」對應區塊（如新增 Enneagram 種族資訊），而不需頻繁修改資料表 Schema 或執行昂貴的 Migration。

### 1.2 `user_quests` 表 (測驗歷程)

此表記錄玩家與 AI GM 的所有互動歷史。

- **`interactions` (JSONB)**：
  完整存儲每一輪對話的題目、玩家原始回答與 AI 分析結果。

> **設計優勢**：
> JSONB 結構便於 Backend 完整取出單次副本的對話樹 (Dialogue Tree)，供 Summary Agent 回溯對話紀錄進行語意分析與摘要生成，無需進行複雜的多表 JOIN。

### 1.3 `game_definitions` 表 (資產定義)

此表為遊戲資產的唯獨字典，作為 Validator Agent 的真值來源。

- **`metadata` (JSONB)**：
  存儲資產的擴充屬性，如職業外觀描述、技能數值權重、相剋關係等。

---

## 2. 效能優化與索引策略 (Index Strategy)

JSONB 雖然靈活，但若操作不當會導致記憶體溢出 (OOM) 或效能低落。系統嚴格執行以下約束：

### 2.1 禁止全量 GIN 索引

針對巨大的 JSONB 欄位（如 `user_quests.interactions`），系統 **禁止** 建立通用的 GIN 索引 (GIN index on jsonb_column)。
原因在於對話紀錄內容龐大且變動頻繁，全量索引將導致寫入效能顯著下降並佔用大量儲存空間。

### 2.2 功能性索引 (Functional Index)

針對高頻查詢的特定 JSONB 鍵值，建立 **B-Tree 功能性索引**。

**範例**：
```sql
-- 為了快速查詢特定職業的玩家分佈
CREATE INDEX idx_user_class ON traits ((final_report->>'class_id'));
```

> **效益**：
> 這確保了當系統需要進行「公會相性對比」或「查詢特定職業排行」時，能達到與一般關聯式欄位相當的查詢速度，而不需掃描整個 JSONB blob。

### 2.3 緩存協作 (Redis Strategy)

為了減少對 PostgreSQL JSONB 欄位的頻繁讀寫壓力：

- **Session Cache**：
  使用 Redis 緩存玩家在當前副本的最後 3 輪對話。
- **寫入策略**：
  對話過程中優先寫入 Redis，僅在達到特定 Checkpoint（如每 10 輪或章節結束）時，才將 `interactions` 批量寫回 PostgreSQL 的 `user_quests` 表。

---
