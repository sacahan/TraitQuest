"""
GitHub Copilot SDK 客戶端管理器

使用官方 copilot SDK
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Callable
import json

try:
    from copilot import CopilotClient
except ImportError:
    CopilotClient = None

from app.core.config import settings

logger = logging.getLogger("app")


class CopilotClientManager:
    """Copilot SDK 客戶端管理器"""

    _instance: Optional["CopilotClientManager"] = None
    _client: Optional[Any] = None
    _sessions: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self):
        """初始化 CopilotClient"""
        if CopilotClient is None:
            logger.warning("⚠️ Copilot SDK 未安裝，進入 Mock 模式")
            return

        try:
            self._client = CopilotClient(
                {
                    "cli_path": settings.COPILOT_CLI_PATH or "copilot",
                    "log_level": settings.COPILOT_LOG_LEVEL or "info",
                    "auto_start": True,
                    "auto_restart": True,
                }
            )
            await self._client.start()
            logger.info("✅ Copilot SDK Client 已啟動")

        except Exception as e:
            logger.error(f"❌ Copilot SDK Client 啟動失敗: {e}")
            self._client = None

    async def shutdown(self):
        """關閉客戶端"""
        if self._client:
            try:
                await self._client.stop()
            except Exception:
                pass
            self._client = None
            logger.info("✅ Copilot SDK Client 已關閉")

    async def get_session(
        self,
        session_id: str,
        model: str = settings.LLM_MODEL,
        tools: Optional[list] = None,
        system_message: Optional[str] = None,
    ) -> Any:
        """創建會話"""
        if self._client is None:
            # 返回一個 MockSession
            from tests.mocks.copilot_mock import MockSession

            return MockSession(
                session_id,
                {"model": model, "tools": tools, "system_prompt": system_message},
            )

        if session_id in self._sessions:
            return self._sessions[session_id]

        session_config = {"model": model}

        if tools:
            session_config["tools"] = tools

        if system_message:
            session_config["system_prompt"] = system_message

        session = await self._client.create_session(session_config)
        self._sessions[session_id] = session
        return session

    async def send_and_wait(
        self,
        session_id: str,
        instruction: str,
        session_getter: Callable,
        timeout: int = 60000,
    ) -> Dict[str, Any]:
        """發送並等待回應"""
        session = await session_getter()
        done = asyncio.Event()
        result = {"content": None}

        def on_event(event):
            # 官方 SDK 事件處理
            event_type = (
                event.type.value if hasattr(event.type, "value") else str(event.type)
            )
            logger.debug(
                f"🔵 [SDK Event] {event_type}: {event.data if hasattr(event, 'data') else 'no data'}"
            )

            if event_type == "assistant.message":
                result["content"] = event.data.content
                logger.info(f"📩 [Assistant Message] content: {result['content']}")
                done.set()
            elif event_type == "tool.execution_end":
                # 工具執行結束
                logger.info(
                    f"🛠️ [Tool Execution End] tool: {event.data.name}, output: {event.data.output}"
                )
                # 這裡原本沒有將工具輸出存入 result，我們應該嘗試捕獲它
                if event.data.output:
                    result["tool_output"] = event.data.output
            elif event_type == "session.idle":
                logger.info("💤 [Session Idle]")
                done.set()

        if hasattr(session, "on"):
            session.on(on_event)

        await session.send({"prompt": instruction})

        try:
            await asyncio.wait_for(done.wait(), timeout=timeout / 1000)
        except asyncio.TimeoutError:
            logger.warning("⏰ Agent 執行逾時")

        # 嘗試解析 content 為 JSON
        final_result = {}
        if result["content"]:
            try:
                final_result = json.loads(result["content"])
            except json.JSONDecodeError:
                # 如果不是 JSON，則直接返回 content
                final_result = {"content": result["content"]}
        elif "tool_output" in result:
            # 如果沒有內容但有工具輸出，則使用工具輸出
            final_result = result["tool_output"]
            if isinstance(final_result, str):
                try:
                    final_result = json.loads(final_result)
                except json.JSONDecodeError:
                    pass

        logger.info(f"📤 [send_and_wait] final_result: {final_result}")
        return final_result


copilot_manager = CopilotClientManager()
