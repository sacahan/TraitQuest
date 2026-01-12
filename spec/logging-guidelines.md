# TraitQuest Logger 建立規則

本文件定義專案統一的日誌記錄規範，確保所有模組遵循一致的日誌建立與使用方式。

---

## 核心原則

### 1. 使用 `__name__` 建立 Logger

所有模組應在檔案頂部使用 `__name__` 建立 logger：

```python
import logging

logger = logging.getLogger(__name__)
```

這會自動產生符合模組路徑的 logger 名稱，例如：
- `app.api.endpoints.quest`
- `app.agents.transformation`
- `app.services.level_system`

### 2. 禁止事項

| ❌ 禁止                                      | 原因                           |
| -------------------------------------------- | ------------------------------ |
| `logging.info("msg")`                        | 繞過命名空間配置               |
| `logging.getLogger("custom_name")`           | 不會套用 `app` 命名空間的配置  |
| `print()` 取代日誌                           | 無法控制級別、無法過濾         |
| 在函數內部重複呼叫 `getLogger()`             | 效能浪費                       |

---

## 日誌級別使用指南

| 級別       | 用途                                           | 範例                                      |
| ---------- | ---------------------------------------------- | ----------------------------------------- |
| `DEBUG`    | 開發階段詳細資訊，生產環境通常關閉             | `logger.debug("變數值: %s", data)`        |
| `INFO`     | 一般運作資訊，記錄重要業務流程                 | `logger.info("用戶 %s 完成測驗", user_id)`|
| `WARNING`  | 潛在問題但不影響運作                           | `logger.warning("API 回應緩慢: %ds", t)`  |
| `ERROR`    | 錯誤發生但系統仍可運作                         | `logger.error("資料庫查詢失敗", exc_info=True)` |
| `CRITICAL` | 嚴重錯誤，系統可能無法繼續運作                 | `logger.critical("資料庫連線中斷")`       |

---

## 標準用法範例

### 基本使用

```python
import logging

logger = logging.getLogger(__name__)

def process_quest(user_id: str, quest_type: str) -> dict:
    logger.info("開始處理測驗: user=%s, type=%s", user_id, quest_type)
    
    try:
        result = do_something()
        logger.debug("處理結果: %s", result)
        return result
    except ValueError as e:
        logger.warning("輸入驗證失敗: %s", e)
        raise
    except Exception as e:
        logger.error("處理測驗時發生錯誤", exc_info=True)
        raise
```

### 記錄例外堆疊

```python
try:
    risky_operation()
except Exception:
    # exc_info=True 會自動附加堆疊追蹤
    logger.error("操作失敗", exc_info=True)
```

### 使用 % 格式化（推薦）

```python
# ✅ 推薦：延遲格式化，效能較佳
logger.info("用戶 %s 獲得 %d 經驗值", user_id, exp_gained)

# ❌ 避免：即使日誌級別過濾，仍會執行字串格式化
logger.info(f"用戶 {user_id} 獲得 {exp_gained} 經驗值")
```

---

## 已配置的命名空間

| 命名空間                   | 用途                  | 預設級別    |
| -------------------------- | --------------------- | ----------- |
| `app`                      | TraitQuest 應用主日誌 | `INFO`      |
| `uvicorn` / `uvicorn.*`    | FastAPI 伺服器日誌    | `INFO`      |
| `litellm` / `LiteLLM`      | LiteLLM AI 呼叫日誌   | `WARNING`   |
| `sqlalchemy.engine`        | SQL 語句日誌          | `WARNING`   |
| `sqlalchemy.pool`          | 連線池日誌            | `WARNING`   |

---

## 日誌輸出格式

### 控制台（彩色）

```
2026-01-12 10:54:02 | INFO | app.api.quest | quest.py:42 | 用戶完成測驗
```

### 檔案（純文字）

```
2026-01-12 10:54:02 | INFO | app.api.quest | quest.py:42 | 用戶完成測驗
```

格式：`時間戳 | 級別 | Logger名稱 | 檔案:行號 | 訊息`

---

## 雜訊過濾

以下日誌會被自動過濾（定義於 `NoiseFilter`）：

- **檔案來源**：`h11_impl.py`、`websockets_impl.py`
- **高頻端點**：
  - `GET /v1/map/regions`
  - `GET /v1/map/check-access`

如需新增過濾規則，請修改 `backend/app/core/logging_config.py` 中的 `NoiseFilter` 類別。

---

## 配置檔案位置

- **主配置**：`backend/app/core/logging_config.py`
- **初始化呼叫**：`backend/app/main.py`

---

## 版本紀錄

| 版本 | 日期       | 說明         |
| ---- | ---------- | ------------ |
| 1.0  | 2026-01-12 | 初版建立     |
