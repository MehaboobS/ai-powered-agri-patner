import hashlib
import logging
from typing import Optional
from app.core.db import prisma_client

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Supports both hashed comparison and direct match
    return (
        hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
        or plain_password == hashed_password
    )

class AdminService:
    async def seed_default_admin(self) -> None:
        """
        Seeds default admin user: Mehaboob / Mehaboob@123 into PostgreSQL if not exists.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        username = "Mehaboob"
        plain_password = "Mehaboob@123"
        hashed = hash_password(plain_password)

        existing = await prisma_client.adminuser.find_unique(where={"username": username})
        if not existing:
            await prisma_client.adminuser.create(
                data={
                    "username": username,
                    "password": hashed,
                    "role": "superadmin"
                }
            )
            logger.info("Admin user '%s' seeded successfully into PostgreSQL.", username)
        else:
            # Ensure password remains synced to Mehaboob@123
            if not verify_password(plain_password, existing.password):
                await prisma_client.adminuser.update(
                    where={"username": username},
                    data={"password": hashed}
                )
                logger.info("Admin user '%s' password updated.", username)

    async def authenticate(self, username: str, password: str) -> Optional[dict]:
        """
        Authenticates admin against database seeded credentials.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        admin = await prisma_client.adminuser.find_unique(where={"username": username.strip()})
        if not admin:
            return None

        if not verify_password(password.strip(), admin.password):
            return None

        return {
            "id": admin.id,
            "username": admin.username,
            "role": admin.role,
            "authenticated": True
        }

admin_service = AdminService()
