#!/bin/bash
# =============================================================================
# TraitQuest Docker 映像建置與推送腳本
# =============================================================================
# 用法：
#   ./build-docker.sh [動作] [平台]
#   
# 動作：
#   build       - 僅建置映像（本地）
#   push        - 推送已存在的映像
#   build-push  - 建置並推送
#
# 平台：
#   arm64       - Apple Silicon / ARM64
#   amd64       - Intel / AMD64
#   all         - 多平台建置（僅限 push 模式）
#
# 範例：
#   ./build-docker.sh build arm64
#   ./build-docker.sh build-push all
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# 配置區
# -----------------------------------------------------------------------------
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-traitquest}"
DOCKER_TAG="${DOCKER_TAG:-latest}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
BUILDX_BUILDER_NAME="traitquest-builder"

# Hardcoded Frontend Environment Variables
VITE_API_BASE_URL="https://traitquest.brianhan.cc/v1"
VITE_GOOGLE_CLIENT_ID="824374244473-06a44nrl7ramqnt270k86i74oe2npsn6.apps.googleusercontent.com"
# WebSocket URL: 從 API URL 推導（https → wss），並加上 /quests/ws 路徑
VITE_WS_BASE_URL="wss://traitquest.brianhan.cc/v1/quests/ws"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# 工具函數
# -----------------------------------------------------------------------------
print_header() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  🌌 ${BLUE}TraitQuest Docker 建置工具${NC}                                   ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# -----------------------------------------------------------------------------
# 環境檢查
# -----------------------------------------------------------------------------
check_prerequisites() {
    print_step "檢查 Docker 環境..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker 服務未運行，請啟動 Docker"
        exit 1
    fi
    
    print_success "Docker 環境正常"
}

# -----------------------------------------------------------------------------
# Buildx 設定
# -----------------------------------------------------------------------------
setup_buildx() {
    print_step "設定 Docker Buildx..."
    
    # 檢查 builder 是否存在
    if ! docker buildx inspect "$BUILDX_BUILDER_NAME" &> /dev/null; then
        print_step "建立 Buildx builder: $BUILDX_BUILDER_NAME"
        docker buildx create --name "$BUILDX_BUILDER_NAME" --driver docker-container --bootstrap
    fi
    
    docker buildx use "$BUILDX_BUILDER_NAME"
    print_success "Buildx 設定完成"
}

# -----------------------------------------------------------------------------
# 互動式模式
# -----------------------------------------------------------------------------
interactive_mode() {
    print_header
    
    # 選擇動作
    echo -e "${BLUE}請選擇動作：${NC}"
    echo "  1) build       - 僅建置映像（本地）"
    echo "  2) push        - 推送已存在的映像"
    echo "  3) build-push  - 建置並推送"
    echo ""
    read -r -p "請輸入選擇 [1-3]: " action_choice
    
    case $action_choice in
        1) ACTION="build" ;;
        2) ACTION="push" ;;
        3) ACTION="build-push" ;;
        *) print_error "無效選擇"; exit 1 ;;
    esac
    
    # 選擇平台
    echo ""
    echo -e "${BLUE}請選擇目標平台：${NC}"
    echo "  1) arm64  - Apple Silicon / ARM64"
    echo "  2) amd64  - Intel / AMD64"
    echo "  3) all    - 多平台建置（僅限推送模式）"
    echo ""
    read -r -p "請輸入選擇 [1-3]: " platform_choice
    
    case $platform_choice in
        1) PLATFORM="arm64" ;;
        2) PLATFORM="amd64" ;;
        3) PLATFORM="all" ;;
        *) print_error "無效選擇"; exit 1 ;;
    esac
    
    # 如果需要推送，確認 Docker 使用者名稱
    if [[ "$ACTION" == "push" || "$ACTION" == "build-push" ]]; then
        if [[ -z "$DOCKER_USERNAME" ]]; then
            echo ""
            read -r -p "請輸入 Docker Hub 使用者名稱 [預設: sacahan]: " input_username
            DOCKER_USERNAME="${input_username:-sacahan}"
        fi
    fi
}

# -----------------------------------------------------------------------------
# 主要建置邏輯
# -----------------------------------------------------------------------------
build_image() {
    local platform="$1"
    local push_flag="$2"
    
    # 決定平台字串
    case $platform in
        arm64) PLATFORMS="linux/arm64" ;;
        amd64) PLATFORMS="linux/amd64" ;;
        all)   PLATFORMS="linux/arm64,linux/amd64" ;;
    esac
    
    # 決定映像名稱
    if [[ -n "$DOCKER_USERNAME" ]]; then
        FULL_IMAGE_NAME="${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
    else
        FULL_IMAGE_NAME="${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
    fi
    
    print_step "建置映像：$FULL_IMAGE_NAME"
    print_step "目標平台：$PLATFORMS"
    
    # 切換到專案根目錄
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_ROOT"
    
    # Use global variables
    local vite_api_base_url="$VITE_API_BASE_URL"
    local vite_google_client_id="$VITE_GOOGLE_CLIENT_ID"
    local vite_ws_base_url="$VITE_WS_BASE_URL"

    # 建置參數
    BUILD_ARGS=(
        "--platform" "$PLATFORMS"
        "-t" "$FULL_IMAGE_NAME"
        "-f" "scripts/Dockerfile"
    )

    if [[ -n "$vite_api_base_url" ]]; then
        BUILD_ARGS+=("--build-arg" "VITE_API_BASE_URL=$vite_api_base_url")
    fi

    if [[ -n "$vite_google_client_id" ]]; then
        BUILD_ARGS+=("--build-arg" "VITE_GOOGLE_CLIENT_ID=$vite_google_client_id")
    fi

    if [[ -n "$vite_ws_base_url" ]]; then
        BUILD_ARGS+=("--build-arg" "VITE_WS_BASE_URL=$vite_ws_base_url")
    fi
    
    # 如果需要推送
    if [[ "$push_flag" == "push" ]]; then
        BUILD_ARGS+=("--push")
    else
        BUILD_ARGS+=("--load")
    fi
    
    # 執行建置
    echo ""
    docker buildx build "${BUILD_ARGS[@]}" .
    
    echo ""
    print_success "建置完成！"
    echo ""
    echo -e "映像名稱：${GREEN}$FULL_IMAGE_NAME${NC}"
    echo -e "平台：${BLUE}$PLATFORMS${NC}"
}

push_image() {
    if [[ -z "$DOCKER_USERNAME" ]]; then
        print_error "推送需要設定 DOCKER_USERNAME"
        exit 1
    fi
    
    FULL_IMAGE_NAME="${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
    
    print_step "推送映像：$FULL_IMAGE_NAME"
    docker push "$FULL_IMAGE_NAME"
    
    print_success "推送完成！"
}

# -----------------------------------------------------------------------------
# 主程式
# -----------------------------------------------------------------------------
main() {
    # 解析命令列參數
    if [[ $# -eq 0 ]]; then
        interactive_mode
    elif [[ $# -eq 2 ]]; then
        ACTION="$1"
        PLATFORM="$2"
    else
        echo "用法：$0 [動作] [平台]"
        echo "動作：build | push | build-push"
        echo "平台：arm64 | amd64 | all"
        exit 1
    fi
    
    print_header
    check_prerequisites
    
    case $ACTION in
        build)
            setup_buildx
            build_image "$PLATFORM" "load"
            ;;
        push)
            push_image
            ;;
        build-push)
            setup_buildx
            build_image "$PLATFORM" "push"
            ;;
        *)
            print_error "未知動作：$ACTION"
            exit 1
            ;;
    esac
}

main "$@"
