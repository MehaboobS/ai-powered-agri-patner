from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/", response_model=HealthResponse)
@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse)
def health_check():
    """
    Returns service availability status and active AI provider state.
    """
    api_key = settings.GEMINI_API_KEY
    return HealthResponse(
        status="online",
        service="Bharath Digital Agriculture Diagnostic Engine",
        ai_provider=f"Gemini AI ({settings.DEFAULT_MODEL})" if (api_key and api_key.strip()) else "Mock Mode (No GEMINI_API_KEY provided)",
        docs_url="/docs"
    )
