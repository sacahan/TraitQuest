# TraitQuest 部署指南（Deployment Guide）

本文件為 **TraitQuest** 專案的 Docker 容器化部署指導規則。
參考 CasualTrader 專案的部署架構，為 TraitQuest 建立標準化的部署流程。

---

## 目錄

1. [架構概述](#架構概述)
2. [目錄結構](#目錄結構)
3. [Dockerfile 規範](#dockerfile-規範)
4. [建置腳本規範](#建置腳本規範)
5. [執行腳本規範](#執行腳本規範)
6. [環境變數配置](#環境變數配置)
7. [部署檢查清單](#部署檢查清單)

---

## 架構概述

TraitQuest 採用**前後端分離架構**，透過 Docker 容器化部署：

| 元件 | 技術棧 | 說明 |
|------|--------|------|
| Frontend | React + Vite + TailwindCSS | 靜態檔案，編譯後由後端服務 |
| Backend | FastAPI + Python 3.11+ | API 服務，使用 uvicorn 運行 |
| Database | PostgreSQL + JSONB | 主資料庫 |
| Cache | Redis | Session 快取與排行榜 |

### 部署模式

```
┌─────────────────────────────────────────────────┐
│              Docker Container                    │
│  ┌─────────────────────────────────────────┐    │
│  │  Python 3.12-slim                        │    │
│  │  ├── FastAPI Backend (port 8000)         │    │
│  │  └── Static Frontend (from /static)      │    │
│  └─────────────────────────────────────────┘    │
│                      │                           │
│                      ▼                           │
│            ┌─────────────────┐                   │
│            │  External       │                   │
│            │  - PostgreSQL   │                   │
│            │  - Redis        │                   │
│            └─────────────────┘                   │
└─────────────────────────────────────────────────┘
```

---

## 目錄結構

建議在專案根目錄建立 `scripts/` 目錄存放部署相關檔案：

```
TraitQuest/
├── scripts/
│   ├── Dockerfile              # Docker 建置定義
│   ├── build-docker.sh         # 建置與推送腳本
│   ├── docker-run.sh           # 執行管理腳本
│   └── .env.docker.example     # 環境變數範本
├── backend/
│   ├── app/
│   │   └── main.py             # FastAPI 應用入口
│   ├── pyproject.toml
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── ...
```

---

## Dockerfile 規範

### 多階段建置（Multi-stage Build）

TraitQuest 的 Dockerfile 應採用多階段建置以優化映像大小：

```dockerfile
# ============================================
# Multi-stage Docker Build for TraitQuest
# ============================================

# ============================================
# Stage 1: Frontend Build
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# 複製 package 檔案
COPY frontend/package*.json ./

# 清理 lock 檔案後安裝依賴
RUN rm -f package-lock.json && npm install

# 複製前端原始碼
COPY frontend/ ./

# 設定生產環境 API URL 並建置
ENV VITE_API_BASE_URL=https://your-production-domain.com
RUN npm run build

# ============================================
# Stage 2: Backend Build
# ============================================
FROM python:3.12-slim AS backend-builder

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 複製 pyproject.toml
COPY backend/pyproject.toml ./

# 安裝 uv 並安裝 Python 依賴
RUN pip install --no-cache-dir uv
RUN uv pip install --system --no-cache .

# ============================================
# Stage 3: Production Image
# ============================================
FROM python:3.12-slim

WORKDIR /app

# 安裝運行時依賴
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 從建置階段複製 Python 依賴
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# 複製後端原始碼
COPY backend/app ./app

# 複製前端建置產物（靜態檔案）
COPY --from=frontend-builder /frontend/dist ./static

# 建立必要目錄
RUN mkdir -p /app/logs

# 設定環境變數
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV STATIC_DIR=/app/static

# 開放埠號
EXPOSE 8000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# 啟動應用
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 關鍵設計原則

| 原則 | 說明 |
|------|------|
| **多階段建置** | 分離建置環境與運行環境，減少最終映像大小 |
| **依賴快取** | 先複製 package 檔案，利用 Docker 層快取加速建置 |
| **輕量基底映像** | 使用 `python:3.12-slim` 而非完整版 |
| **健康檢查** | 內建 HEALTHCHECK 確保服務可用性 |
| **非 root 用戶** | 生產環境建議建立專用用戶運行 |

---

## 建置腳本規範

`build-docker.sh` 負責建置與推送 Docker 映像：

```bash
#!/bin/zsh
# ============================================
# Build and Deploy Script for TraitQuest
# ============================================
set -e

SCRIPT_DIR="$( cd "$( dirname "${ZSH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# 配置
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-trait-quest}"
DOCKER_TAG="${DOCKER_TAG:-latest}"
DOCKER_USERNAME="${DOCKER_USERNAME:-your-username}"

# 顯示用法
show_usage() {
    echo "用法: ./build-docker.sh [OPTIONS]"
    echo ""
    echo "選項（若未提供則互動式選擇）:"
    echo "  --platform PLATFORM    選擇平台: arm64, amd64, 或 all"
    echo "  --action ACTION        選擇動作: build, push, 或 build-push"
    echo "  --no-interactive       使用預設值不提示"
    echo "  --help                 顯示此幫助訊息"
    echo ""
    echo "環境變數:"
    echo "  DOCKER_USERNAME        Docker Hub 用戶名"
    echo "  DOCKER_IMAGE_NAME      映像名稱 (預設: trait-quest)"
    echo "  DOCKER_TAG             映像標籤 (預設: latest)"
}

# 解析命令列參數
PLATFORM=""
ACTION=""
INTERACTIVE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --action)
            ACTION="$2"
            shift 2
            ;;
        --no-interactive)
            INTERACTIVE=false
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "未知選項: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 檢查必要環境變數
if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ 錯誤: DOCKER_USERNAME 環境變數為必填"
    exit 1
fi

# 互動式選擇平台
if [ -z "$PLATFORM" ] && [ "$INTERACTIVE" = true ]; then
    echo ""
    echo "================================================"
    echo "平台選擇"
    echo "================================================"
    echo "1. arm64 (M1/M2/M3 Mac, ARM 伺服器)"
    echo "2. amd64 (Intel Mac, x86_64 伺服器)"
    echo "3. all (arm64 + amd64)"
    echo ""
    echo -n "選擇平台 (1-3) [預設: 1]: "
    read platform_choice
    platform_choice=${platform_choice:-1}

    case $platform_choice in
        1) PLATFORM="arm64" ;;
        2) PLATFORM="amd64" ;;
        3) PLATFORM="all" ;;
        *) PLATFORM="arm64" ;;
    esac
elif [ -z "$PLATFORM" ]; then
    PLATFORM="arm64"
fi

# 驗證平台選擇
case $PLATFORM in
    arm64) PLATFORMS="linux/arm64" ;;
    amd64) PLATFORMS="linux/amd64" ;;
    all)   PLATFORMS="linux/arm64,linux/amd64" ;;
    *)
        echo "❌ 無效平台: $PLATFORM"
        exit 1
        ;;
esac

# 互動式選擇動作
if [ -z "$ACTION" ] && [ "$INTERACTIVE" = true ]; then
    echo ""
    echo "================================================"
    echo "動作選擇"
    echo "================================================"
    echo "1. build（僅建置，不推送）"
    echo "2. push（僅推送現有映像）"
    echo "3. build-push（建置後推送）[預設]"
    echo ""
    echo -n "選擇動作 (1-3) [預設: 3]: "
    read action_choice
    action_choice=${action_choice:-3}

    case $action_choice in
        1) ACTION="build" ;;
        2) ACTION="push" ;;
        3) ACTION="build-push" ;;
        *) ACTION="build-push" ;;
    esac
elif [ -z "$ACTION" ]; then
    ACTION="build-push"
fi

FULL_IMAGE_NAME="$DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$DOCKER_TAG"

echo ""
echo "================================================"
echo "TraitQuest - 建置與部署"
echo "================================================"
echo "映像: $FULL_IMAGE_NAME"
echo "平台: $PLATFORMS"
echo "動作: $ACTION"
echo "================================================"

# 設定 Docker buildx
echo ""
echo "⚙️  設定 Docker buildx 多平台建置..."

BUILDER_NAME="multiarch-builder"

if ! docker buildx inspect "$BUILDER_NAME" &> /dev/null; then
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --use
else
    docker buildx use "$BUILDER_NAME"
fi

docker buildx inspect --bootstrap

# 建置映像
if [ "$ACTION" != "push" ]; then
    echo ""
    echo "🏗️  建置 Docker 映像..."
    
    cd "$PROJECT_ROOT"
    
    PUSH_FLAG="--load"
    if [ "$ACTION" = "build-push" ]; then
        PUSH_FLAG="--push"
    fi

    docker buildx build \
        --platform "$PLATFORMS" \
        $PUSH_FLAG \
        -t "$FULL_IMAGE_NAME" \
        -f scripts/Dockerfile \
        .

    echo "✅ Docker 映像建置成功！"
fi

# 推送映像
if [ "$ACTION" != "build" ]; then
    echo ""
    echo "📤 推送 Docker 映像..."

    docker buildx build \
        --platform "$PLATFORMS" \
        --push \
        -t "$FULL_IMAGE_NAME" \
        -f scripts/Dockerfile \
        "$PROJECT_ROOT"

    echo "✅ Docker 映像推送成功！"
fi

echo ""
echo "🎉 完成！"
```

---

## 執行腳本規範

`docker-run.sh` 負責容器的啟動、停止與管理：

```bash
#!/bin/bash
# ============================================
# TraitQuest Docker 執行腳本
# ============================================
# 用法：./docker-run.sh [command] [options]
#
# 命令：
#   up          - 啟動容器（後台）
#   down        - 停止並移除容器
#   pull        - 拉取鏡像
#   logs        - 查看容器日誌
#   shell       - 進入容器 shell
#   test        - 執行測試
#   info        - 顯示服務信息
#   clean       - 清理所有 Docker 資源
#   help        - 顯示幫助信息

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 專案根目錄
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 預設環境文件
ENV_FILE="${PROJECT_DIR}/.env.docker"

# Docker 配置
IMAGE_NAME="${DOCKER_USERNAME:-your-username}/trait-quest:latest"
CONTAINER_NAME="trait-quest"
HOST_PORT="${HOST_PORT:-8000}"

# Docker 網路
NETWORK_NAME="trait-quest-network"

# 日誌目錄
LOGS_DIR="${PROJECT_DIR}/logs"

# 檢查環境文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}⚠️  未找到 $ENV_FILE${NC}"
        if [ -f "${ENV_FILE}.example" ]; then
            cp "${ENV_FILE}.example" "$ENV_FILE"
            echo -e "${GREEN}✓ 已建立 $ENV_FILE${NC}"
            echo -e "${YELLOW}請編輯 .env.docker 配置環境變數${NC}"
            exit 1
        else
            echo -e "${RED}✗ 找不到 .env.docker.example${NC}"
            exit 1
        fi
    fi
}

# 確保網路存在
ensure_network() {
    if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
        echo -e "${BLUE}📡 建立 Docker 網路: $NETWORK_NAME${NC}"
        docker network create "$NETWORK_NAME"
    fi
}

# 啟動容器
start_container() {
    ensure_network
    check_env_file

    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}ℹ️ 容器已在運行${NC}"
        return 0
    fi

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${BLUE}啟動現有容器...${NC}"
        docker start "$CONTAINER_NAME"
        show_info
        return 0
    fi

    echo -e "${BLUE}🚀 啟動容器...${NC}"

    mkdir -p "$LOGS_DIR"

    docker run -d \
        --name "$CONTAINER_NAME" \
        --network "$NETWORK_NAME" \
        --add-host host.docker.internal:host-gateway \
        --env-file "$ENV_FILE" \
        -p "${HOST_PORT}:8000" \
        -v "${LOGS_DIR}:/app/logs" \
        -e TZ=Asia/Taipei \
        --restart unless-stopped \
        "$IMAGE_NAME"

    echo -e "${GREEN}✓ 容器已啟動${NC}"
    show_info
}

# 停止容器
stop_container() {
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}ℹ️ 容器不存在${NC}"
        return 0
    fi

    echo -e "${BLUE}🛑 停止容器...${NC}"
    docker stop "$CONTAINER_NAME"
    echo -e "${GREEN}✓ 容器已停止${NC}"
}

# 移除容器
remove_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${BLUE}移除容器...${NC}"
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME"
    fi
}

# 拉取映像
pull_image() {
    echo -e "${BLUE}📥 拉取映像: $IMAGE_NAME${NC}"
    if docker pull "$IMAGE_NAME"; then
        echo -e "${GREEN}✓ 映像拉取成功${NC}"
    else
        echo -e "${RED}✗ 映像拉取失敗${NC}"
        exit 1
    fi
}

# 查看日誌
show_logs() {
    echo -e "${BLUE}📋 顯示容器日誌（Ctrl+C 退出）...${NC}"
    docker logs -f "$CONTAINER_NAME"
}

# 進入 shell
enter_shell() {
    echo -e "${BLUE}🐚 進入容器...${NC}"
    docker exec -it "$CONTAINER_NAME" /bin/bash
}

# 執行測試
run_tests() {
    echo -e "${BLUE}🧪 執行測試...${NC}"
    docker exec -T "$CONTAINER_NAME" pytest tests/ -v
}

# 清理資源
clean_up() {
    echo -e "${YELLOW}⚠️  此操作將刪除所有容器和映像...${NC}"
    read -p "確認繼續？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        remove_container
        docker rmi "$IMAGE_NAME" 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}✓ 清理完成${NC}"
    fi
}

# 顯示服務信息
show_info() {
    echo -e "${BLUE}📊 服務信息：${NC}"
    echo -e "  應用: http://localhost:${HOST_PORT}"
    echo -e "  API 文檔: http://localhost:${HOST_PORT}/api/docs"
    echo ""
    echo -e "${BLUE}常用命令：${NC}"
    echo -e "  查看日誌: ${GREEN}./docker-run.sh logs${NC}"
    echo -e "  進入 Shell: ${GREEN}./docker-run.sh shell${NC}"
    echo -e "  停止服務: ${GREEN}./docker-run.sh down${NC}"
}

# 顯示幫助
show_help() {
    cat << 'EOF'
TraitQuest Docker 執行腳本

用法: ./docker-run.sh [command]

📋 命令:
  up         啟動容器
  down       停止並移除容器
  pull       拉取映像
  logs       查看日誌
  shell      進入容器 shell
  test       執行測試
  info       顯示服務信息
  clean      清理資源
  help       顯示此幫助

🚀 快速開始:
  1. 拉取映像: ./docker-run.sh pull
  2. 啟動服務: ./docker-run.sh up
  3. 查看日誌: ./docker-run.sh logs
  4. 停止服務: ./docker-run.sh down

EOF
}

# 主函式
main() {
    local command=${1:-up}

    case "$command" in
        up)       start_container ;;
        down)     remove_container ;;
        pull)     pull_image ;;
        logs)     show_logs ;;
        shell)    enter_shell ;;
        test)     run_tests ;;
        info)     show_info ;;
        clean)    clean_up ;;
        help|-h|--help) show_help ;;
        *)
            echo -e "${RED}❌ 未知命令: $command${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
```

---

## 環境變數配置

### .env.docker.example

```bash
# ============================================
# TraitQuest Docker 環境變數
# ============================================

# 資料庫配置
DATABASE_URL=postgresql+asyncpg://postgres:password@host.docker.internal:5432/traitquest

# Redis 配置
REDIS_URL=redis://host.docker.internal:6379/0

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT 配置
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256

# AI 服務配置（如需要）
GEMINI_API_KEY=your-gemini-api-key

# CORS 配置
CORS_ORIGINS=https://your-production-domain.com

# 日誌等級
LOG_LEVEL=INFO
```

### 重要說明

- `host.docker.internal` 用於從容器內連接主機上的服務
- 生產環境應使用實際的資料庫連線字串
- 所有敏感資訊應透過環境變數或 Secret 管理工具注入

---

## 部署檢查清單

### 建置前檢查

- [ ] 確認 `pyproject.toml` 依賴完整
- [ ] 確認 `package.json` 依賴完整
- [ ] 確認前端 `VITE_API_BASE_URL` 已設定正確的生產 URL
- [ ] 確認 `.env.docker` 已配置所有必要變數

### 建置時檢查

- [ ] Docker buildx 已正確設定
- [ ] 選擇正確的目標平台（arm64/amd64）
- [ ] 映像名稱與標籤正確

### 部署時檢查

- [ ] 資料庫遷移已執行
- [ ] Redis 服務可用
- [ ] PostgreSQL 服務可用
- [ ] 網路配置正確
- [ ] 埠號映射正確
- [ ] 環境變數已注入

### 部署後驗證

- [ ] 健康檢查端點回應正常 (`/api/health`)
- [ ] 前端頁面可正常載入
- [ ] API 文檔可訪問 (`/api/docs`)
- [ ] Google OAuth 登入功能正常
- [ ] 資料庫連線正常
- [ ] Redis 快取功能正常

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初版，參考 CasualTrader 專案建立 |

---

**TraitQuest 部署指南 Version 1.0.0**  
建立日期：2026 年 1 月 12 日
