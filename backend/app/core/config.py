from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

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
    GITHUB_COPILOT_TOKEN: str = "your_token"

    # Application
    APP_ENV: str = "development"
    SECRET_KEY: str = "your_secret_key"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

settings = Settings()
