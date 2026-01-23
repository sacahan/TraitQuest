#!/bin/bash
# =============================================================================
# TraitQuest Docker 啟動腳本
# 處理 Copilot CLI 認證並啟動 FastAPI 應用
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔═════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  🌌 ${GREEN}TraitQuest 後端啟動程序${NC}                             ${BLUE}║${NC}"
echo -e "${BLUE}╚═════════════════════════════════════════════════════╝${NC}"

# -----------------------------------------------------------------------------
# Copilot CLI 認證處理
# -----------------------------------------------------------------------------
setup_copilot_auth() {
	echo ""
	echo -e "${BLUE}🔐 檢查 Copilot CLI 認證狀態...${NC}"

	if [ -z "$GITHUB_COPILOT_TOKEN" ]; then
		echo -e "${YELLOW}⚠️  警告: GITHUB_COPILOT_TOKEN 環境變數未設置${NC}"
		echo -e "${YELLOW}   Copilot CLI 可能無法正常工作${NC}"
		return 0
	fi

	COPILOT_CONFIG_DIR="$HOME/.config/github-copilot-cli"
	AUTH_FILE="$COPILOT_CONFIG_DIR/auth.json"

	if [ -f "$AUTH_FILE" ]; then
		echo -e "${GREEN}✅ Copilot CLI 認證已存在${NC}"
		return 0
	fi

	echo -e "${BLUE}📝 建立 Copilot CLI 認證配置...${NC}"

	mkdir -p "$COPILOT_CONFIG_DIR"

	cat >"$AUTH_FILE" <<EOF
{
  "token": "$GITHUB_COPILOT_TOKEN",
  "authType": "token",
  "lastValidated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

	echo -e "${GREEN}✅ Copilot CLI 認證配置完成${NC}"
	echo -e "${BLUE}💡 使用 Token 認證模式${NC}"
}

# -----------------------------------------------------------------------------
# 啟動 FastAPI 應用
# -----------------------------------------------------------------------------
start_application() {
	echo ""
	echo -e "${BLUE}🚀 啟動 TraitQuest API 服務...${NC}"
	echo ""

	exec uvicorn app.main:app --host 0.0.0.0 --port 8000
}

# -----------------------------------------------------------------------------
# 主程式
# -----------------------------------------------------------------------------
main() {
	setup_copilot_auth
	start_application
}

main "$@"
