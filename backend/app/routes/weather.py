from typing import Optional
from fastapi import APIRouter, Query
from app.controllers.weather_controller import weather_controller
from app.schemas.weather import WeatherAdvisoryResponse

router = APIRouter(prefix="/api", tags=["Weather Advisory"])

@router.get(
    "/weather-advisory",
    response_model=WeatherAdvisoryResponse,
    summary="Get localized spray window & agro-weather advisory"
)
async def get_weather_advisory(
    lat: float = Query(..., description="Farm latitude (-90 to 90)", examples=[13.13]),
    lon: float = Query(..., description="Farm longitude (-180 to 180)", examples=[78.13]),
    language: Optional[str] = Query("English", description="Response language")
):
    """
    Returns real-time weather metrics, next 6-hour rain risk, wind drift analysis,
    and agronomic guidance on whether it is safe, risky, or prohibited to spray remedies.
    """
    return await weather_controller.get_spray_advisory(
        lat=lat,
        lon=lon,
        language=language
    )
