from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://traitsuser:password@localhost:5432/traitquest"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 5
    REDIS_PASSWORD: Optional[str] = None

    # LiteLLM / LLM
    LITELLM_URL: str = "http://localhost:4000"
    LLM_MODEL: str = "github_copilot/gpt-4o"
    GITHUB_COPILOT_TOKEN: str = "your_token"
    GITHUB_COPILOT_HEADERS: dict = {
        "editor-version": "vscode/1.85.1",
        "editor-plugin-version": "copilot/1.155.0",
        "Copilot-Integration-Id": "vscode-chat",
        "user-agent": "GithubCopilot/1.155.0"
    }

    # Application
    APP_ENV: str = "development"
    SECRET_KEY: str = ""
    LOG_FILE_PATH: Optional[str] = "logs/app.log"

    # CORS - 開發環境預設，正式環境請透過環境變數設定
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

settings = Settings()
