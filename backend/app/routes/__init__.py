from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.diagnosis import router as diagnosis_router
from app.routes.weather import router as weather_router
from app.routes.mandi import router as mandi_router
from app.routes.location import router as location_router

from app.routes.fertilizer import router as fertilizer_router
from app.routes.farmer import router as farmer_router
from app.routes.admin import admin_router
from app.routes.schemes import schemes_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(diagnosis_router)
api_router.include_router(weather_router)
api_router.include_router(mandi_router)
api_router.include_router(location_router)
api_router.include_router(fertilizer_router)
api_router.include_router(farmer_router)
api_router.include_router(admin_router)
api_router.include_router(schemes_router)

__all__ = [
    "api_router",
    "health_router",
    "diagnosis_router",
    "weather_router",
    "mandi_router",
    "location_router",
    "fertilizer_router",
    "farmer_router",
    "admin_router",
    "schemes_router"
]

