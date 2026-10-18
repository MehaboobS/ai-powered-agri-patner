from typing import Optional
from fastapi import HTTPException
from app.services.weather_service import weather_service
from app.schemas.weather import WeatherAdvisoryResponse

class WeatherController:
    async def get_spray_advisory(
        self,
        lat: float,
        lon: float,
        language: Optional[str] = "English"
    ) -> WeatherAdvisoryResponse:
        """
        Validates geographical coordinates and returns tailored spray advisory.
        """
        if not (-90.0 <= lat <= 90.0):
            raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90 degrees.")
        if not (-180.0 <= lon <= 180.0):
            raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180 degrees.")

        return await weather_service.fetch_weather_advisory(
            latitude=lat,
            longitude=lon,
            language=language
        )

weather_controller = WeatherController()
