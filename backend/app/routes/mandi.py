from typing import Optional
from fastapi import APIRouter, Query
from app.controllers.mandi_controller import mandi_controller
from app.schemas.mandi import MandiSearchRequest, MandiSearchResponse

router = APIRouter(prefix="/api", tags=["Mandi Rates & Market Intelligence"])

@router.post(
    "/mandi-rates",
    response_model=MandiSearchResponse,
    summary="Search APMC Mandi rates near the farmer's location"
)
async def search_mandi_rates(request: MandiSearchRequest):
    """
    Returns nearest APMC wholesale price ranges, modal prices, distance in km,
    and a localized spoken script with numbers in digits 1, 2, 3 for TTS playback.
    """
    return await mandi_controller.get_mandi_rates(request)

@router.get(
    "/mandi-rates",
    response_model=MandiSearchResponse,
    summary="Get Mandi rates by query string or crop near coordinates"
)
async def get_mandi_rates(
    query: Optional[str] = Query(None, description="Voice query or crop search term"),
    language: Optional[str] = Query("English", description="Target language: English, Hindi, Telugu, Tamil, Kannada, Marathi"),
    state: Optional[str] = Query(None, description="State filter"),
    lat: Optional[float] = Query(None, description="Farmer latitude"),
    lon: Optional[float] = Query(None, description="Farmer longitude")
):
    request = MandiSearchRequest(
        query=query,
        language=language or "English",
        state=state,
        latitude=lat,
        longitude=lon
    )
    return await mandi_controller.get_mandi_rates(request)
