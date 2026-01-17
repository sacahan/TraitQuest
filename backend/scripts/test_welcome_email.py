import sys
import os
from dotenv import load_dotenv

# 先載入環境變數，確保服務模組載入時能抓到配置
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

# 將 app 目錄加入 path 以便引入服務
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.email_service import send_welcome_email


def test():
    test_email = os.getenv("SMTP_USER")  # 預設發送給開發者
    if not test_email:
        print("請在 .env 中設定 SMTP_USER")
        return

    print(f"正在嘗試發送測試郵件至: {test_email}...")

    send_welcome_email(
        to_email=test_email,
        username="勇者 Sacahan",
        frontend_url="https://traitquest.brianhan.cc",
    )


if __name__ == "__main__":
    test()
