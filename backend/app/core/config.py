from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # 允許環境變數中有多餘的舊變數
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://traitsuser:password@localhost:5432/traitquest"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 5
    REDIS_PASSWORD: Optional[str] = None

    # Copilot SDK Configuration
    LLM_MODEL: str = "gpt-4o"
    COPILOT_CLI_PATH: Optional[str] = None
    COPILOT_LOG_LEVEL: str = "info"

    # Copilot CLI Authentication (必要）
    GITHUB_COPILOT_TOKEN: str = ""

    # Application
    APP_ENV: str = "development"
    SECRET_KEY: str = ""
    LOG_FILE_PATH: Optional[str] = "logs/app.log"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://traitquest.brianhan.cc",
        "https://sacahan.github.io",
    ]

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SMTP (Email)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SENDER_EMAIL: Optional[str] = None


settings = Settings()
