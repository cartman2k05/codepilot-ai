import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@ep-xxxx.neon.tech/codepilot"
    GROQ_API_KEY: str = "gsk_placeholder_key"
    HINDSIGHT_URL: str = "https://api.hindsight.vectorize.io"
    HINDSIGHT_API_KEY: str = ""
    JWT_SECRET: str = "codepilot-dev-secret-change-in-production-1234567890"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Sync loaded setting key into OS environment for third-party libraries (LangChain/Groq SDK)
os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
