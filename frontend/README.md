# TraitQuest 前端守則：英雄覺醒介面

歡迎來到 **TraitQuest** 的魔導前端核心。本專案將枯燥的心理測驗轉化為具有靈魂深度的黑暗奇幻 RPG 覺醒之旅。

## 🔮 核心精神

本介面遵循《TraitQuest 開發憲章》，所有設計必須符合：

- **古老卷軸**、**深淵冒險**、**魔導技術**的沉浸感。
- **色彩規範**：核心螢光綠 `#11D452` 用於能量高亮，背景色採用深綠黑 `#102216`。
- **交互限制**：所有文字必須具備「打字機效果」，由引導者 **艾比 (Abby)** 進行對話。

## 🛠 技術祭壇 (Tech Stack)

- **核心框架**: React 19 + TypeScript + Vite
- **狀態管理**: Zustand (靈魂狀態持久化)
- **視覺特效**: Framer Motion (動態符文與轉場)
- **樣式系統**: Tailwind CSS 4.0 (魔導樣式封裝)
- **資料可視化**: Chart.js (英雄特質雷達圖)

## 📜 冒險準備 (Setup)

### 啟動儀式

1. **注入依賴**:

   ```bash
   npm install
   ```

2. **開啟傳送門**:

   ```bash
   npm run dev
   ```

3. **查看法典**:
   造訪 `http://localhost:5173` 進入試煉場。

## 📂 卷軸目錄 (Folder Structure)

- `src/components`: 覺醒組件 (NavBar, Abby 對話框, 屬性條)
- `src/stores`: 靈魂狀態中心 (AuthStatus, QuestProgress)
- `src/services`: 魔導通訊層 (API Client)
- `src/assets`: 遺失的藝術資產 (符文圖騰, 背景影像)

## ⚖️ 開發禁律

- ❌ 嚴禁使用過於現代、扁平化的設計。
- ✅ 必須確保答題時側邊屬性槽有即時視覺反饋。
- ✅ 所有 ID 輸出必須符合 `game_definitions` 預定義清單。

---

**願你的靈魂在試煉中覺醒。**
