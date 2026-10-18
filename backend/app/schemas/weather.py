from typing import Optional
from pydantic import BaseModel, Field

class LocationCoordinates(BaseModel):
    latitude: float = Field(description="Latitude in decimal degrees")
    longitude: float = Field(description="Longitude in decimal degrees")

class CurrentWeather(BaseModel):
    temperature_c: float = Field(description="Current ambient temperature in Celsius")
    humidity_percent: int = Field(description="Current relative humidity percentage")
    wind_speed_kmh: float = Field(description="Current wind speed in km/h at 10m height")
    precipitation_mm: float = Field(description="Current precipitation in mm")
    weather_condition: str = Field(description="Human readable weather condition summary")

class SprayWindow(BaseModel):
    status: str = Field(description="One of 'SAFE', 'CAUTION', 'AVOID'")
    badge_color: str = Field(description="One of 'green', 'yellow', 'red'")
    headline: str = Field(description="Short bold status summary for farmer")
    recommended_window: str = Field(description="Best time of day to apply remedies")
    advisory_message: str = Field(description="Detailed agronomic guidance regarding rain, drift, and temperature")
    rain_risk_next_6h_percent: int = Field(description="Maximum rain probability in next 6 hours")
    max_wind_next_6h_kmh: float = Field(description="Maximum forecasted wind speed in next 6 hours")

class WeatherAdvisoryResponse(BaseModel):
    location: LocationCoordinates
    spray_advisory: SprayWindow
    current_weather: CurrentWeather
    forecast_summary: str = Field(description="24-hour weather outlook summary")
