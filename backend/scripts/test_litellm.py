#!/usr/bin/env python3
"""
LiteLLM Proxy 連線測試腳本
用於驗證 Proxy 配置和診斷連線問題
"""
import os
import sys

# 載入 .env
from dotenv import load_dotenv
load_dotenv()

# 啟用 debug 模式
import litellm
litellm._turn_on_debug()

# 設定日誌級別
import logging
logging.basicConfig(level=logging.DEBUG)

from litellm import completion

def test_litellm_proxy():
    """測試 LiteLLM Proxy 連線"""
    
    model = os.getenv("LLM_MODEL", "openai/gpt-4o")
    api_base = os.getenv("LITELLM_PROXY_URL", "https://litellm.brianhan.cc")
    api_key = os.getenv("LITELLM_PROXY_API_KEY", "")
    
    print("=" * 60)
    print("LiteLLM Proxy 連線測試")
    print("=" * 60)
    print(f"Model:    {model}")
    print(f"API Base: {api_base}")
    print(f"API Key:  {api_key[:15]}..." if api_key else "API Key:  (未設定)")
    print("=" * 60)
    
    try:
        response = completion(
            model=model,
            api_base=api_base,
            api_key=api_key,
            messages=[
                {"role": "user", "content": "請回答：1+1=?"}
            ],
            max_tokens=50
        )
        
        print("\n✅ 連線成功！")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"\n❌ 連線失敗：{type(e).__name__}")
        print(f"錯誤訊息：{str(e)}")
        
        # 嘗試印出更多詳情
        if hasattr(e, 'response'):
            print(f"HTTP Response: {e.response}")
        if hasattr(e, 'status_code'):
            print(f"Status Code: {e.status_code}")
            
        return False

if __name__ == "__main__":
    success = test_litellm_proxy()
    sys.exit(0 if success else 1)
