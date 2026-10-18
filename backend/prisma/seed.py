import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import logging
from prisma import Prisma
from app.services.location_service import INDIAN_AGRICULTURAL_LOCATIONS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prisma-seed")

async def seed_locations():
    db = Prisma()
    await db.connect()
    logger.info("Connected to PostgreSQL database 'agri'. Seeding locations...")

    count = 0
    for loc in INDIAN_AGRICULTURAL_LOCATIONS:
        # Upsert location so it can be re-run safely
        await db.location.upsert(
            where={"id": loc["id"]},
            data={
                "create": {
                    "id": loc["id"],
                    "city": loc["city"],
                    "state": loc["state"],
                    "display_name": loc["display_name"],
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "major_crops": loc["major_crops"],
                },
                "update": {
                    "city": loc["city"],
                    "state": loc["state"],
                    "display_name": loc["display_name"],
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "major_crops": loc["major_crops"],
                }
            }
        )
        count += 1

    logger.info(f"Successfully seeded {count} agricultural locations into PostgreSQL!")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_locations())
