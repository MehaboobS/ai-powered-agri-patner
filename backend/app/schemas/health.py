from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
    ai_provider: str
    docs_url: str
