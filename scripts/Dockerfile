# =============================================================================
# TraitQuest 多階段 Docker 建置定義
# =============================================================================
# 此 Dockerfile 將前端與後端打包成單一映像，前端靜態檔案由 FastAPI 提供服務。
# 遵循 /deploy-guild 規範：依賴快取優先、輕量基底映像、健康檢查、非 root 用戶。
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Frontend Builder
# 建置 React/Vite 前端靜態檔案
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 依賴快取優先：先複製 package 檔案
COPY frontend/package.json frontend/package-lock.json ./

# 安裝依賴
RUN npm ci --silent

# 複製前端原始碼
COPY frontend/ ./

# 設定生產環境 API URL（將由 docker-run.sh 傳入）
ARG VITE_API_BASE_URL=/v1
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# 建置前端
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Backend Builder
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
# Stage 3: Production Image
# 最終精簡映像
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

# 從 frontend-builder 複製前端建置產物到 static 目錄
COPY --from=frontend-builder /app/frontend/dist /app/static

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
