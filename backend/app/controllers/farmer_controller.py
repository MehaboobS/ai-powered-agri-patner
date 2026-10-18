from typing import Optional
from app.services.farmer_service import farmer_service
from app.schemas.farmer import FarmerRegisterRequest, FarmerResponse, FarmerListResponse

class FarmerController:
    async def register(self, request: FarmerRegisterRequest) -> FarmerResponse:
        """
        Handles farmer registration.
        """
        return await farmer_service.register_or_update_farmer(request)

    async def list_farmers(self, limit: int = 100) -> FarmerListResponse:
        """
        Handles admin list retrieval.
        """
        return await farmer_service.get_all_farmers(limit)

    async def check_phone(self, phone: str) -> Optional[FarmerResponse]:
        """
        Checks if a farmer is already registered by phone number.
        """
        return await farmer_service.get_farmer_by_phone(phone)

farmer_controller = FarmerController()
