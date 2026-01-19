# =============================================================================
# TraitQuest 後端 Docker 建置定義
# =============================================================================
# 此 Dockerfile 只打包後端 FastAPI 服務，前端已分離部署至 GitHub Pages。
# 遵循 /deploy-guild 規範：依賴快取優先、輕量基底映像、健康檢查、非 root 用戶。
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Backend Builder
# 安裝 Python 依賴（使用 uv 套件管理器）
# -----------------------------------------------------------------------------
FROM python:3.12-slim AS backend-builder

WORKDIR /app

# 安裝 uv 套件管理器
RUN pip install --no-cache-dir uv

# 依賴快取優先：先複製依賴定義檔案
COPY backend/pyproject.toml backend/uv.lock ./

# 使用 uv 安裝依賴到 .venv
RUN uv sync --frozen --no-dev

# -----------------------------------------------------------------------------
# Stage 2: Production Image
# 最終精簡映像（僅後端 API 服務）
# -----------------------------------------------------------------------------
FROM python:3.12-slim

# 設定環境變數
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TZ=Asia/Taipei

WORKDIR /app

# 安裝必要的系統依賴（curl 用於健康檢查）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 建立非 root 用戶
RUN groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --shell /bin/bash --create-home appuser

# 從 backend-builder 複製虛擬環境
COPY --from=backend-builder /app/.venv /app/.venv

# 複製後端原始碼
COPY backend/app /app/app
COPY backend/main.py /app/main.py

# 建立日誌目錄
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

# 設定虛擬環境路徑
ENV PATH="/app/.venv/bin:$PATH"

# 修改擁有者
RUN chown -R appuser:appgroup /app

# 切換到非 root 用戶
USER appuser

# 暴露端口
EXPOSE 8000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# 啟動應用程式
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
