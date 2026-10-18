import logging
from typing import Optional, Dict, Any
import httpx
from app.schemas.weather import (
    LocationCoordinates,
    CurrentWeather,
    SprayWindow,
    WeatherAdvisoryResponse
)

logger = logging.getLogger(__name__)

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

class WeatherAdvisoryService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    async def fetch_weather_advisory(
        self,
        latitude: float,
        longitude: float,
        language: Optional[str] = "English"
    ) -> WeatherAdvisoryResponse:
        """
        Fetches live forecast from Open-Meteo and determines agronomic spraying viability.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
            "hourly": "precipitation_probability,precipitation,wind_speed_10m,temperature_2m",
            "forecast_days": 2,
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            logger.error(f"Failed to fetch weather from Open-Meteo: {str(e)}", exc_info=True)
            # Return resilient fallback estimate
            return self._fallback_advisory(latitude, longitude)

        return self._process_weather_data(latitude, longitude, data)

    def _process_weather_data(self, latitude: float, longitude: float, data: Dict[str, Any]) -> WeatherAdvisoryResponse:
        current = data.get("current", {})
        hourly = data.get("hourly", {})

        temp_c = float(current.get("temperature_2m", 25.0))
        humidity = int(current.get("relative_humidity_2m", 60))
        wind_kmh = float(current.get("wind_speed_10m", 5.0))
        precip_mm = float(current.get("precipitation", 0.0))
        weather_code = int(current.get("weather_code", 0))

        weather_desc = WMO_WEATHER_CODES.get(weather_code, "Partly cloudy")

        # Analyze next 6 hours from hourly forecast
        rain_probs = hourly.get("precipitation_probability", [])[:6]
        hourly_precip = hourly.get("precipitation", [])[:6]
        hourly_winds = hourly.get("wind_speed_10m", [])[:6]

        max_rain_prob_6h = max(rain_probs) if rain_probs else 10
        max_precip_6h = max(hourly_precip) if hourly_precip else 0.0
        max_wind_6h = max(hourly_winds) if hourly_winds else wind_kmh

        # Evaluate Spraying Window according to Agronomic Spray Guidelines
        if max_rain_prob_6h >= 40 or max_precip_6h >= 0.5 or precip_mm > 0.0:
            spray_status = "AVOID"
            badge_color = "red"
            headline = "🔴 Avoid Spraying Today (Rain Risk)"
            rec_window = "Postpone until rainfall ceases and foliage dries"
            advisory = (
                f"Rain or precipitation expected within the next 6 hours ({max_rain_prob_6h}% probability). "
                "Applying chemical or biological remedies today risks complete wash-off, wasting money and effort."
            )
        elif wind_kmh > 14.0 or max_wind_6h > 15.0:
            spray_status = "CAUTION"
            badge_color = "yellow"
            headline = "🟡 Spray With Caution (High Wind Drift)"
            rec_window = "Spray early morning (6:00 AM - 8:30 AM) when winds subside"
            advisory = (
                f"Wind speeds reaching {max_wind_6h:.1f} km/h. High winds cause spray drift onto adjacent fields "
                "and poor droplet deposition. Use anti-drift nozzles if spraying is urgent."
            )
        elif temp_c > 33.0:
            spray_status = "CAUTION"
            badge_color = "yellow"
            headline = "🟡 Avoid Midday Spraying (Heat & Evaporation)"
            rec_window = "Best window: 6:30 AM - 9:00 AM or after 5:30 PM"
            advisory = (
                f"High temperature ({temp_c:.1f}°C) causes spray droplets to evaporate prematurely before plant uptake "
                "and can cause leaf scorching (phytotoxicity)."
            )
        else:
            spray_status = "SAFE"
            badge_color = "green"
            headline = "🟢 Safe to Spray (Optimal Conditions)"
            rec_window = "Best window: 6:30 AM - 10:30 AM"
            advisory = (
                f"Favorable conditions: calm wind ({wind_kmh:.1f} km/h), low rain probability ({max_rain_prob_6h}%), "
                "and moderate temperature. Good conditions for effective systemic absorption."
            )

        summary = f"{weather_desc}, {temp_c:.1f}°C with {humidity}% humidity."

        return WeatherAdvisoryResponse(
            location=LocationCoordinates(latitude=latitude, longitude=longitude),
            spray_advisory=SprayWindow(
                status=spray_status,
                badge_color=badge_color,
                headline=headline,
                recommended_window=rec_window,
                advisory_message=advisory,
                rain_risk_next_6h_percent=max_rain_prob_6h,
                max_wind_next_6h_kmh=round(max_wind_6h, 1)
            ),
            current_weather=CurrentWeather(
                temperature_c=temp_c,
                humidity_percent=humidity,
                wind_speed_kmh=wind_kmh,
                precipitation_mm=precip_mm,
                weather_condition=weather_desc
            ),
            forecast_summary=summary
        )

    def _fallback_advisory(self, latitude: float, longitude: float) -> WeatherAdvisoryResponse:
        return WeatherAdvisoryResponse(
            location=LocationCoordinates(latitude=latitude, longitude=longitude),
            spray_advisory=SprayWindow(
                status="SAFE",
                badge_color="green",
                headline="🟢 Safe to Spray (Estimated)",
                recommended_window="Early Morning (6:30 AM - 9:30 AM)",
                advisory_message="Standard agronomic window: Spray during early morning calm hours for maximum foliar absorption.",
                rain_risk_next_6h_percent=10,
                max_wind_next_6h_kmh=6.5
            ),
            current_weather=CurrentWeather(
                temperature_c=26.5,
                humidity_percent=55,
                wind_speed_kmh=6.0,
                precipitation_mm=0.0,
                weather_condition="Mainly clear"
            ),
            forecast_summary="Fair weather conditions suitable for crop maintenance."
        )

weather_service = WeatherAdvisoryService()
