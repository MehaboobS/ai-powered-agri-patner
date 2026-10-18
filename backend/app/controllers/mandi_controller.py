from app.services.mandi_service import mandi_service
from app.schemas.mandi import MandiSearchResponse, MandiSearchRequest

class MandiController:
    async def get_mandi_rates(
        self,
        request: MandiSearchRequest
    ) -> MandiSearchResponse:
        """
        Orchestrates Mandi rate searching based on farmer voice/text input,
        selecting the nearest APMC market based on geographical distance.
        """
        return await mandi_service.search_mandi_rates(
            query=request.query,
            crops=request.crops,
            language=request.language or "English",
            city=request.city,
            state=request.state,
            latitude=request.latitude,
            longitude=request.longitude
        )

mandi_controller = MandiController()
