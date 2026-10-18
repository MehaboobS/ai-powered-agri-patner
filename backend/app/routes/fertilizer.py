from typing import List, Optional
from fastapi import APIRouter, Query, status
from app.controllers.fertilizer_controller import fertilizer_controller
from app.schemas.fertilizer import (
    FertilizerCalculateRequest,
    FertilizerCalculateResponse,
    SaveFertilizerPlanRequest,
    FertilizerPlanRecord
)

router = APIRouter(prefix="/api/fertilizer", tags=["Fertilizer & NPK Dosage Calculator"])

@router.post(
    "/calculate",
    response_model=FertilizerCalculateResponse,
    summary="Calculate exact NPK requirements, commercial fertilizer bags, and organic alternatives"
)
def calculate_fertilizer_dosage(request: FertilizerCalculateRequest):
    """
    Computes pure N, P, K, commercial bags of Urea, DAP, MOP, organic recommendations (FYM, Vermicompost),
    and subsidized MRP cost based on acreage and crop growth stage.
    """
    return fertilizer_controller.calculate_dosage(request)

@router.post(
    "/save",
    response_model=FertilizerPlanRecord,
    status_code=status.HTTP_201_CREATED,
    summary="Save calculated fertilizer plan to PostgreSQL via Prisma"
)
async def save_fertilizer_plan(request: SaveFertilizerPlanRequest):
    """
    Persists the customized crop fertilizer plan in PostgreSQL.
    """
    return await fertilizer_controller.save_plan(request)

@router.get(
    "/saved",
    response_model=List[FertilizerPlanRecord],
    summary="Retrieve saved fertilizer plans from PostgreSQL"
)
async def get_saved_fertilizer_plans(limit: Optional[int] = Query(10, ge=1, le=50)):
    """
    Returns recent saved fertilizer plans for the farmer's plots.
    """
    return await fertilizer_controller.get_saved_plans(limit=limit)
