import logging
from typing import List, Optional
from app.core.db import prisma_client
from app.schemas.farmer import FarmerRegisterRequest, FarmerResponse, FarmerListResponse

logger = logging.getLogger(__name__)

class FarmerService:
    async def register_or_update_farmer(self, req: FarmerRegisterRequest) -> FarmerResponse:
        """
        Registers a new farmer or updates their language/profile if already registered.
        No login or password required — phone number acts as unique identifier.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        clean_phone = req.phone_number.strip().replace(" ", "").replace("-", "") if req.phone_number else None
        if clean_phone and len(clean_phone) == 0:
            clean_phone = None

        if clean_phone:
            existing = await prisma_client.farmer.find_first(where={"phone_number": clean_phone})
            if existing:
                farmer = await prisma_client.farmer.update(
                    where={"id": existing.id},
                    data={
                        "name": req.name.strip(),
                        "language": req.language.strip(),
                        "state": req.state if req.state else existing.state,
                        "city": req.city if req.city else existing.city,
                        "latitude": req.latitude if req.latitude is not None else existing.latitude,
                        "longitude": req.longitude if req.longitude is not None else existing.longitude
                    }
                )
            else:
                farmer = await prisma_client.farmer.create(
                    data={
                        "name": req.name.strip(),
                        "phone_number": clean_phone,
                        "language": req.language.strip(),
                        "state": req.state,
                        "city": req.city,
                        "latitude": req.latitude,
                        "longitude": req.longitude
                    }
                )
        else:
            # Register farmer without phone number
            farmer = await prisma_client.farmer.create(
                data={
                    "name": req.name.strip(),
                    "phone_number": None,
                    "language": req.language.strip(),
                    "state": req.state,
                    "city": req.city,
                    "latitude": req.latitude,
                    "longitude": req.longitude
                }
            )

        return FarmerResponse(
            id=farmer.id,
            name=farmer.name,
            phone_number=farmer.phone_number,
            language=farmer.language,
            state=farmer.state,
            city=farmer.city,
            latitude=farmer.latitude,
            longitude=farmer.longitude,
            created_at=farmer.created_at.strftime("%Y-%m-%d %H:%M")
        )

    async def get_all_farmers(self, limit: int = 100) -> FarmerListResponse:
        """
        Retrieves registered farmers for the Admin Dashboard.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        total = await prisma_client.farmer.count()
        farmers = await prisma_client.farmer.find_many(
            take=limit,
            order={"created_at": "desc"}
        )

        return FarmerListResponse(
            total=total,
            farmers=[
                FarmerResponse(
                    id=f.id,
                    name=f.name,
                    phone_number=f.phone_number,
                    language=f.language,
                    state=f.state,
                    city=f.city,
                    latitude=f.latitude,
                    longitude=f.longitude,
                    created_at=f.created_at.strftime("%Y-%m-%d %H:%M")
                )
                for f in farmers
            ]
        )

    async def get_farmer_by_phone(self, phone: str) -> Optional[FarmerResponse]:
        """
        Looks up a farmer by phone number.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        clean_phone = phone.strip().replace(" ", "").replace("-", "")
        farmer = await prisma_client.farmer.find_unique(where={"phone_number": clean_phone})
        if not farmer:
            return None

        return FarmerResponse(
            id=farmer.id,
            name=farmer.name,
            phone_number=farmer.phone_number,
            language=farmer.language,
            state=farmer.state,
            city=farmer.city,
            created_at=farmer.created_at.strftime("%Y-%m-%d %H:%M")
        )

farmer_service = FarmerService()
