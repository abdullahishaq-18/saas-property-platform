from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SaaS Starter API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/saas_starter"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ALGORITHM: str = "HS256"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
