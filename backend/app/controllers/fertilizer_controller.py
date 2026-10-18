from typing import List
from app.services.fertilizer_service import fertilizer_service
from app.schemas.fertilizer import (
    FertilizerCalculateRequest,
    FertilizerCalculateResponse,
    SaveFertilizerPlanRequest,
    FertilizerPlanRecord
)

class FertilizerController:
    def calculate_dosage(
        self,
        request: FertilizerCalculateRequest
    ) -> FertilizerCalculateResponse:
        """
        Calculates exact NPK, commercial bag counts, and organic alternatives.
        """
        return fertilizer_service.calculate_dosage(request)

    async def save_plan(
        self,
        request: SaveFertilizerPlanRequest
    ) -> FertilizerPlanRecord:
        """
        Persists a customized fertilizer plan into PostgreSQL via Prisma.
        """
        return await fertilizer_service.save_plan(request)

    async def get_saved_plans(
        self,
        limit: int = 10
    ) -> List[FertilizerPlanRecord]:
        """
        Retrieves recent saved fertilizer plans from PostgreSQL.
        """
        return await fertilizer_service.get_saved_plans(limit)

fertilizer_controller = FertilizerController()
