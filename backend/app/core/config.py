import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Bharath Digital Agriculture Network API"
    PROJECT_DESCRIPTION: str = "Digital Public Good for AI-driven Agro-Advisories & Crop Diagnostics"
    PROJECT_VERSION: str = "1.0.0"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    AGMARKNET_API_KEY: str = os.getenv("AGMARKNET_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/agri")
    PORT: int = int(os.getenv("PORT", 8000))
    DEFAULT_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    # Max upload image size: default 10MB
    MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
        origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
        return origins if origins else ["*"]

settings = Settings()
