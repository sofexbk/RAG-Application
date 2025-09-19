from __future__ import annotations

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    QDRANT_URL: str
    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    OPENAI_API_KEY: str
    CLAUDE_API_KEY: str | None = None

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "../.env")


settings = Settings()
