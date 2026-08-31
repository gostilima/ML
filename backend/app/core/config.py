"""Application settings, loaded from environment variables / .env file."""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    ENV: str = "development"
    PROJECT_NAME: str = "Marketplace Intelligence"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://mi_user:mi_password@localhost:5432/marketplace_intelligence"
    TEST_DATABASE_URL: str = "sqlite:///./test.db"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Auth
    JWT_SECRET: str = "change-me-super-secret-value-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30

    CREDENTIALS_ENCRYPTION_KEY: str = "change-me-generate-a-fernet-key"

    # Mercado Livre
    MELI_CLIENT_ID: str = ""
    MELI_CLIENT_SECRET: str = ""
    MELI_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/mercado-livre/oauth/callback"
    # NOTE: Brazil's Mercado Livre site is "mercadolivre.com.br" (Portuguese
    # spelling, with a "v") -- not "mercadolibre.com.br" (Spanish spelling +
    # .br), which isn't a real domain and fails DNS resolution entirely.
    # The Spanish spelling is only correct for the unified API host below.
    MELI_AUTH_BASE_URL: str = "https://auth.mercadolivre.com.br"
    MELI_API_BASE_URL: str = "https://api.mercadolibre.com"

    # AI
    AI_API_KEY: str = ""

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    TESTING: bool = False

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
