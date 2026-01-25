#!/bin/bash
# =============================================================================
# TraitQuest Docker 容器執行管理腳本
# =============================================================================
# 用法：
#   ./docker-run.sh [命令]
#
# 命令：
#   up      - 啟動容器
#   down    - 停止並移除容器
#   pull    - 拉取映像
#   logs    - 查看日誌
#   shell   - 進入容器
#   test    - 執行測試
#   clean   - 清理資源
#   info    - 顯示服務信息
#   help    - 顯示幫助
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# 配置區
# -----------------------------------------------------------------------------
CONTAINER_NAME="${CONTAINER_NAME:-traitquest-api}"
NETWORK_NAME="${NETWORK_NAME:-sacahan-network}"
IMAGE_NAME="${IMAGE_NAME:-sacahan/traitquest-api:latest}"
HOST_PORT="${HOST_PORT:-8000}"
LOGS_DIR="${LOGS_DIR:-./logs}"

# 腳本目錄
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.docker"
ENV_EXAMPLE_FILE="${SCRIPT_DIR}/.env.docker.example"



# -----------------------------------------------------------------------------
# 工具函數
# -----------------------------------------------------------------------------


# 工具函數
# -----------------------------------------------------------------------------
print_header() {
	echo ""
	echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
	echo -e "${CYAN}║${NC}  🌌 ${BLUE}TraitQuest Docker 容器管理工具${NC}                               ${CYAN}║${NC}"
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
# 環境檔案檢查
# -----------------------------------------------------------------------------
check_env_file() {
	if [[ ! -f "$ENV_FILE" ]]; then
		print_warning "找不到環境檔案：$ENV_FILE"

		if [[ -f "$ENV_EXAMPLE_FILE" ]]; then
			echo ""
			echo "請複製範本檔案並填入實際數值："
			echo -e "  ${CYAN}cp $ENV_EXAMPLE_FILE $ENV_FILE${NC}"
			echo -e "  ${CYAN}vim $ENV_FILE${NC}"
			echo ""
		fi

		read -r -p "是否繼續執行（不建議）？[y/N]: " confirm
		if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
			exit 1
		fi
	else
		# 從 .env.docker 讀取 HOST_PORT（如果有定義）
		local env_host_port
		env_host_port=$(grep -E "^HOST_PORT=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d ' "'"'"'')
		if [[ -n "$env_host_port" ]]; then
			HOST_PORT="$env_host_port"
			print_info "從 .env.docker 讀取 HOST_PORT=$HOST_PORT"
		fi
	fi
}

# -----------------------------------------------------------------------------
# 網路管理
# -----------------------------------------------------------------------------
ensure_network() {
	if docker network inspect "$NETWORK_NAME" &>/dev/null; then
		print_info "使用現有網路：$NETWORK_NAME"
	else
		print_error "網路 $NETWORK_NAME 不存在！"
		echo ""
		echo "請先建立網路："
		echo -e "  ${CYAN}docker network create $NETWORK_NAME${NC}"
		echo ""
		exit 1
	fi
}

# -----------------------------------------------------------------------------
# 容器狀態檢查
# -----------------------------------------------------------------------------
is_container_running() {
	docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

is_container_exists() {
	docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# -----------------------------------------------------------------------------
# 命令實作
# -----------------------------------------------------------------------------

cmd_up() {
	print_header
	check_env_file

	ensure_network

	if is_container_running; then
		print_warning "容器 $CONTAINER_NAME 已在運行中"
		return 0
	fi

	if is_container_exists; then
		print_step "移除舊容器：$CONTAINER_NAME"
		docker rm "$CONTAINER_NAME"
	fi

	# 確保日誌目錄存在
	mkdir -p "$LOGS_DIR"

	print_step "啟動容器：$CONTAINER_NAME"

	# 建構 docker run 參數
	RUN_ARGS=(
		"-d"
		"--name" "$CONTAINER_NAME"
		"--network" "$NETWORK_NAME"
		"--add-host" "host.docker.internal:host-gateway"
		"-p" "${HOST_PORT}:8000"
		"-v" "$(realpath "$LOGS_DIR"):/app/logs"

		"-e" "TZ=Asia/Taipei"
		"--restart" "unless-stopped"
	)

	# 如果環境檔案存在，加入 --env-file
	if [[ -f "$ENV_FILE" ]]; then
		RUN_ARGS+=("--env-file" "$ENV_FILE")
	fi

	RUN_ARGS+=("$IMAGE_NAME")

	docker run "${RUN_ARGS[@]}"

	echo ""
	print_success "容器啟動成功！"
	echo ""
	echo -e "服務位址：${GREEN}http://localhost:${HOST_PORT}${NC}"
	echo -e "API 文檔：${GREEN}http://localhost:${HOST_PORT}/docs${NC}"
	echo -e "健康檢查：${GREEN}http://localhost:${HOST_PORT}/api/health${NC}"
}

cmd_down() {
	print_header

	if ! is_container_exists; then
		print_info "容器 $CONTAINER_NAME 不存在"
		return 0
	fi

	print_step "停止容器：$CONTAINER_NAME"
	docker stop "$CONTAINER_NAME" 2>/dev/null || true

	print_step "移除容器：$CONTAINER_NAME"
	docker rm "$CONTAINER_NAME" 2>/dev/null || true

	print_success "容器已停止並移除"
}

cmd_pull() {
	print_header
	print_step "拉取映像：$IMAGE_NAME"
	docker pull "$IMAGE_NAME"
	print_success "映像拉取完成"
}

cmd_logs() {
	if ! is_container_exists; then
		print_error "容器 $CONTAINER_NAME 不存在"
		exit 1
	fi

	# 預設顯示最後 100 行並持續追蹤
	docker logs -f --tail 100 "$CONTAINER_NAME"
}

cmd_shell() {
	if ! is_container_running; then
		print_error "容器 $CONTAINER_NAME 未運行"
		exit 1
	fi

	print_step "進入容器 $CONTAINER_NAME..."
	docker exec -it "$CONTAINER_NAME" /bin/bash
}

cmd_test() {
	print_header

	if ! is_container_running; then
		print_error "容器 $CONTAINER_NAME 未運行"
		exit 1
	fi

	print_step "執行健康檢查..."

	# 嘗試呼叫健康檢查端點
	if curl -sf "http://localhost:${HOST_PORT}/api/health" >/dev/null; then
		print_success "健康檢查通過！"

		# 顯示回應內容
		echo ""
		echo "回應內容："
		curl -s "http://localhost:${HOST_PORT}/api/health" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:${HOST_PORT}/api/health"
	else
		print_error "健康檢查失敗"
		exit 1
	fi
}

cmd_clean() {
	print_header

	print_step "停止並移除容器..."
	cmd_down

	print_step "移除映像：$IMAGE_NAME"
	docker rmi "$IMAGE_NAME" 2>/dev/null || print_warning "映像不存在或無法移除"

	print_step "移除未使用的映像..."
	docker image prune -f

	print_step "移除未使用的網路..."
	docker network prune -f



	print_success "清理完成"
}

cmd_info() {
	print_header

	echo -e "${MAGENTA}═══ 配置資訊 ═══${NC}"
	echo -e "容器名稱：${CYAN}$CONTAINER_NAME${NC}"
	echo -e "網路名稱：${CYAN}$NETWORK_NAME${NC}"
	echo -e "映像名稱：${CYAN}$IMAGE_NAME${NC}"
	echo -e "主機端口：${CYAN}$HOST_PORT${NC}"
	echo -e "日誌目錄：${CYAN}$LOGS_DIR${NC}"
	echo -e "環境檔案：${CYAN}$ENV_FILE${NC}"
	echo ""

	echo -e "${MAGENTA}═══ 容器狀態 ═══${NC}"
	if is_container_running; then
		echo -e "狀態：${GREEN}運行中${NC}"
		echo ""
		docker ps --filter "name=$CONTAINER_NAME" --format "table {{.ID}}\t{{.Status}}\t{{.Ports}}"
	elif is_container_exists; then
		echo -e "狀態：${YELLOW}已停止${NC}"
	else
		echo -e "狀態：${RED}不存在${NC}"
	fi
	echo ""

	echo -e "${MAGENTA}═══ 服務 URL ═══${NC}"
	echo -e "首頁：     ${GREEN}http://localhost:${HOST_PORT}${NC}"
	echo -e "API 文檔： ${GREEN}http://localhost:${HOST_PORT}/docs${NC}"
	echo -e "健康檢查： ${GREEN}http://localhost:${HOST_PORT}/api/health${NC}"
}

cmd_help() {
	print_header

	echo "用法：$0 [命令]"
	echo ""
	echo "可用命令："
	echo -e "  ${GREEN}up${NC}      - 啟動容器"
	echo -e "  ${GREEN}down${NC}    - 停止並移除容器"
	echo -e "  ${GREEN}pull${NC}    - 拉取映像"
	echo -e "  ${GREEN}logs${NC}    - 查看日誌（持續追蹤）"
	echo -e "  ${GREEN}shell${NC}   - 進入容器 Shell"
	echo -e "  ${GREEN}test${NC}    - 執行健康檢查"
	echo -e "  ${GREEN}clean${NC}   - 清理容器和未使用的資源"
	echo -e "  ${GREEN}info${NC}    - 顯示服務信息"
	echo -e "  ${GREEN}help${NC}    - 顯示此幫助"
	echo ""
	echo "環境變數："
	echo "  CONTAINER_NAME  - 容器名稱（預設：traitquest）"
	echo "  NETWORK_NAME    - 網路名稱（預設：sacahan-network）"
	echo "  IMAGE_NAME      - 映像名稱（預設：traitquest:latest）"
	echo "  HOST_PORT       - 主機端口（預設：8000）"
	echo "  LOGS_DIR        - 日誌目錄（預設：./logs）"
}

# -----------------------------------------------------------------------------
# 主程式
# -----------------------------------------------------------------------------
main() {
	local command="${1:-help}"

	case "$command" in
	up) cmd_up ;;
	down) cmd_down ;;
	pull) cmd_pull ;;
	logs) cmd_logs ;;
	shell) cmd_shell ;;
	test) cmd_test ;;
	clean) cmd_clean ;;
	info) cmd_info ;;
	help) cmd_help ;;
	*)
		print_error "未知命令：$command"
		echo ""
		cmd_help
		exit 1
		;;
	esac
}

main "$@"
