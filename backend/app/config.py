"""Application configuration using Pydantic Settings."""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Central settings for LegalEase backend service."""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "allow"}

    PROJECT_NAME: str = "LegalEase Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # LLM Settings
    GEMINI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    OPENAI_API_KEY: str = Field(default="")
    LLM_PROVIDER: str = Field(default="mock")  # 'gemini', 'anthropic', 'mock'
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_TOKENS: int = 2048

    # Authentication & Security
    JWT_SECRET: str = Field(default="dev_secret_key_change_in_production_32bytes")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # File uploads & validation
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"]
    UPLOAD_DIR: str = "./data/uploads"
    VECTOR_STORE_DIR: str = "./data/vector_store"

    # Rate limiting
    RATE_LIMIT_ANALYZE: str = "15/minute"
    RATE_LIMIT_CHAT: str = "30/minute"


settings = Settings()
