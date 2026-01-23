"""
Copilot SDK 日誌格式統一機制

將 Copilot SDK 的原始日誌格式轉換為 TraitQuest 統一格式：
[時間戳記] Emoji [標籤] 訊息
"""
import logging
import re
from datetime import datetime
from typing import Optional


class CopilotLogFormatter(logging.Formatter):
    """
    自訂格式化器，將 Copilot SDK 日誌轉換為 TraitQuest 格式
    
    Copilot SDK 原始格式：
    copilot:INFO: Starting client...
    
    TraitQuest 格式：
    [2024-01-23 10:00:00] 🤖 [CopilotSDK] Starting client...
    """

    LEVEL_EMOJIS = {
        logging.DEBUG: "🔍",
        logging.INFO: "🤖",
        logging.WARNING: "⚠️",
        logging.ERROR: "❌",
        logging.CRITICAL: "💀",
    }

    KEYWORD_MAPPING = {
        "Starting client": "ClientInit",
        "Session created": "SessionInit",
        "Session destroyed": "SessionDestroy",
        "Agent executed": "AgentRun",
        "Tool called": "ToolCall",
        "error": "Error",
        "warning": "Warning",
    }

    def format(self, record: logging.LogRecord) -> str:
        """
        格式化日誌記錄
        
        Args:
            record: 日誌記錄
            
        Returns:
            str: 格式化後的字串
        """
        timestamp = datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")
        emoji = self.LEVEL_EMOJIS.get(record.levelno, "📋")
        tag = self._extract_tag(record.getMessage())
        
        return f"[{timestamp}] {emoji} [{tag}] {record.getMessage()}"

    def _extract_tag(self, message: str) -> str:
        """
        從訊息中提取標籤
        
        Args:
            message: 原始訊息
            
        Returns:
            str: 標籤
        """
        for keyword, tag in self.KEYWORD_MAPPING.items():
            if keyword.lower() in message.lower():
                return tag
        return "CopilotSDK"


class CopilotLogAdapter(logging.LoggerAdapter):
    """
    Copilot SDK 日誌適配器
    
    攔截 Copilot SDK 的日誌輸出，重新格式化後發送到 TraitQuest logger
    """

    def __init__(self, logger: logging.Logger, extra: Optional[dict] = None):
        super().__init__(logger, extra or {})
        self.formatter = CopilotLogFormatter()

    def process(self, msg: any, kwargs: dict) -> tuple[any, dict]:
        """
        處理日誌訊息
        
        Args:
            msg: 原始訊息
            kwargs: 日誌參數
            
        Returns:
            tuple: 處理後的訊息和參數
        """
        if isinstance(msg, str):
            record = self.makeRecord(
                self.name, logging.INFO, "", 0, msg, (), None
            )
            msg = self.formatter.format(record)
        
        return msg, kwargs


def setup_copilot_logging():
    """
    設置 Copilot SDK 日誌格式統一
    
    此函式會：
    1. 獲取 'copilot' logger
    2. 移除所有現有的 handler
    3. 添加統一格式的 handler
    """
    from app.core.logging_config import logger
    
    copilot_logger = logging.getLogger("copilot")
    copilot_logger.setLevel(logging.INFO)
    
    copilot_logger.handlers.clear()
    
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    handler.setFormatter(CopilotLogFormatter())
    
    copilot_logger.addHandler(handler)
    
    copilot_logger.propagate = False
    
    logger.info("✅ Copilot SDK 日誌格式已統一")


if __name__ == "__main__":
    setup_copilot_logging()
    
    copilot_logger = logging.getLogger("copilot")
    copilot_logger.info("Starting client...")
    copilot_logger.warning("Session error detected")
    copilot_logger.error("Failed to create agent")
