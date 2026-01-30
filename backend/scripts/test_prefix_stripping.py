
import os
import logging
from litellm import completion
import litellm

# Enable debug
litellm._turn_on_debug()

# Configuration
api_base = os.getenv("LITELLM_PROXY_URL", "https://litellm.brianhan.cc")
api_key = os.getenv("LITELLM_PROXY_API_KEY", "sk-M8MLkfUrlYpeEE39QvC7UQ")

# Test case: prefix with openai/
model_name = "openai/github_copilot/gpt-4o"

print(f"Testing model: {model_name}")
print(f"Proxy: {api_base}")

try:
    response = completion(
        model=model_name,
        api_base=api_base,
        api_key=api_key,
        messages=[{"role": "user", "content": "Hi"}],
        max_tokens=10
    )
    print("\n✅ Success!")
    print(response)
except Exception as e:
    print("\n❌ Failed!")
    print(e)
