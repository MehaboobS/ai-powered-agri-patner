from typing import List, Optional
from fastapi import APIRouter, Query
from app.services.location_service import location_service
from app.schemas.location import LocationItem

router = APIRouter(prefix="/api", tags=["Locations & Geocoding"])

@router.get(
    "/locations",
    response_model=List[LocationItem],
    summary="Get list of predefined Indian agricultural cities and states"
)
async def get_locations(
    q: Optional[str] = Query(None, description="Optional search filter by City or State name"),
    limit: Optional[int] = Query(None, description="Maximum number of items to return")
):
    """
    Returns pre-seeded agricultural cities, districts, and states across India from PostgreSQL.
    If no query is passed, returns the full catalog to be cached in frontend global memory.
    """
    if q and q.strip():
        lim = limit if limit is not None else 5
        return await location_service.search_locations(query=q, limit=lim)
    
    all_locs = await location_service.get_all_locations()
    if limit is not None:
        return all_locs[:limit]
    return all_locs
