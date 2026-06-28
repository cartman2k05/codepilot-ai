import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./codepilot.db"
    GROQ_API_KEY: str = "gsk_placeholder_key"
    HINDSIGHT_URL: str = "http://localhost:8888"
    JWT_SECRET: str = "codepilot-dev-secret-change-in-production-1234567890"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    CASCADEFLOW_BUDGET: float = 1.0
    CASCADEFLOW_MODE: str = "enforce"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Sync loaded setting key into OS environment for third-party libraries (LangChain/Groq SDK)
os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY

