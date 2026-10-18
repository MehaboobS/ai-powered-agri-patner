import logging
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.scheme import (
    SchemeOut,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    SaveSchemeRequest,
    SavedSchemeResponse
)
from app.services.scheme_service import scheme_service

logger = logging.getLogger(__name__)

schemes_router = APIRouter(prefix="/api/schemes", tags=["Government Schemes & Subsidies"])

@schemes_router.get("/list", response_model=List[SchemeOut])
async def list_all_schemes():
    """
    Returns the complete directory of government agricultural subsidy & welfare schemes.
    """
    try:
        return await scheme_service.get_all_schemes()
    except Exception as e:
        logger.error(f"Error fetching schemes list: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch government schemes: {str(e)}"
        )

@schemes_router.post("/check-eligibility", response_model=EligibilityCheckResponse)
async def check_scheme_eligibility(req: EligibilityCheckRequest):
    """
    Evaluates farmer's landholding acreage, primary crop, state, and category
    to compute matching government schemes, eligibility percentages, and estimated financial assistance in INR.
    """
    try:
        return await scheme_service.check_eligibility(req)
    except Exception as e:
        logger.error(f"Error checking scheme eligibility: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate scheme eligibility: {str(e)}"
        )

@schemes_router.post("/save", response_model=SavedSchemeResponse)
async def save_farmer_scheme(req: SaveSchemeRequest):
    """
    Bookmarks a government scheme to a registered farmer's profile in PostgreSQL.
    """
    try:
        return await scheme_service.save_farmer_scheme(req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error saving scheme for farmer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save scheme: {str(e)}"
        )

@schemes_router.get("/saved/{farmer_id}", response_model=List[SavedSchemeResponse])
async def get_saved_schemes(farmer_id: str):
    """
    Retrieves all bookmarked schemes for the specified farmer ID.
    """
    try:
        return await scheme_service.get_farmer_saved_schemes(farmer_id)
    except Exception as e:
        logger.error(f"Error fetching saved schemes for farmer {farmer_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch saved schemes: {str(e)}"
        )
