from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.controllers.farmer_controller import farmer_controller
from app.schemas.farmer import FarmerRegisterRequest, FarmerResponse, FarmerListResponse

router = APIRouter(prefix="/api/farmers", tags=["Farmer Registration & Admin"])

@router.post(
    "/register",
    response_model=FarmerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new farmer or update profile without password login"
)
async def register_farmer(request: FarmerRegisterRequest):
    """
    Registers a farmer with their name, 10-digit phone number, and chosen regional language.
    Stored permanently in PostgreSQL. No passwords needed.
    """
    return await farmer_controller.register(request)

@router.get(
    "",
    response_model=FarmerListResponse,
    summary="List all registered farmers for Admin Dashboard"
)
async def get_all_registered_farmers(limit: Optional[int] = Query(100, ge=1, le=500)):
    """
    Returns registered farmers list and total count for the Admin Dashboard.
    """
    return await farmer_controller.list_farmers(limit)

@router.get(
    "/check/{phone}",
    response_model=Optional[FarmerResponse],
    summary="Check if a phone number is registered"
)
async def check_farmer_phone(phone: str):
    """
    Checks if a phone number already exists in the registered database.
    """
    farmer = await farmer_controller.check_phone(phone)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer phone number not found."
        )
    return farmer
