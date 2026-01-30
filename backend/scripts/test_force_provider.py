import os
import logging
from litellm import completion
import litellm

# Enable debug
litellm._turn_on_debug()

# Configuration
api_base = os.getenv("LITELLM_PROXY_URL", "https://litellm.brianhan.cc")
api_key = os.getenv("LITELLM_PROXY_API_KEY", "sk-M8MLkfUrlYpeEE39QvC7UQ")

# Test case: explicit github_copilot/gpt-4o BUT with custom_llm_provider='openai'
model_name = "github_copilot/gpt-4o"

print(f"Testing model: {model_name} with custom_llm_provider='openai'")
print(f"Proxy: {api_base}")

try:
    response = completion(
        model=model_name,
        api_base=api_base,
        api_key=api_key,
        custom_llm_provider="openai",  # FORCE OpenAI provider
        extra_headers={"User-Agent": "curl/8.7.1"},  # Spoof User-Agent
        messages=[{"role": "user", "content": "Hi"}],
        max_tokens=10,
    )
    print("\n✅ Success!")
    print(response)
except Exception as e:
    print("\n❌ Failed!")
    print(e)
