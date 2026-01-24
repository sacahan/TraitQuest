"""
Copilot SDK 工具定義

使用 Pydantic 模型
"""
import logging
from typing import Callable, Any, Dict, Type, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("app")


def create_copilot_tool(
    name: str,
    description: str,
    handler: Callable,
    params_model: Optional[Type[BaseModel]] = None,
) -> Any:
    """
    建立 Copilot SDK 工具
    
    Args:
        name: 工具名稱
        description: 工具描述
        handler: 非同步處理函式
        params_model: 可選的 Pydantic 參數模型
    
    Returns:
        Copilot SDK 工具物件
    """
    try:
        from copilot import define_tool, Tool
    except ImportError:
        logger.warning("⚠️ Copilot SDK 未安裝，返回 Mock 工具")
        return {"name": name, "description": description, "handler": handler}
    
    if params_model:
        return define_tool(
            name=name,
            description=description,
            params_type=params_model,
        )(handler)
    else:
        # 手動定義 schema
        return Tool(
            name=name,
            description=description,
            parameters={"type": "object", "properties": {}, "required": []},
            handler=handler
        )


class ToolOutputCapture:
    """
    工具輸出捕獲器
    
    用於在 Copilot SDK 的非工具環境中捕獲輸出
    """
    _outputs: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def capture(cls, tool_name: str, output: Dict[str, Any]):
        """
        捕獲工具輸出
        
        Args:
            tool_name: 工具名稱
            output: 輸出資料
        """
        cls._outputs[tool_name] = output
        logger.debug(f"📥 捕獲工具 {tool_name} 輸出: {list(output.keys())}")

    @classmethod
    def get(cls, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        獲取工具輸出
        
        Args:
            tool_name: 工具名稱
        
        Returns:
            Optional[Dict]: 工具輸出，若不存在則返回 None
        """
        return cls._outputs.get(tool_name)

    @classmethod
    def clear(cls, tool_name: Optional[str] = None):
        """
        清除工具輸出
        
        Args:
            tool_name: 工具名稱，若為 None 則清除所有
        """
        if tool_name:
            cls._outputs.pop(tool_name, None)
        else:
            cls._outputs.clear()
        logger.debug(f"🗑 清除工具輸出: {tool_name if tool_name else 'all'}")
