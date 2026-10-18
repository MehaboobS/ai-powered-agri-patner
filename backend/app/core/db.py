import logging
from prisma import Prisma

logger = logging.getLogger("prisma-db")

prisma_client = Prisma()

async def connect_db():
    """
    Connects to PostgreSQL database 'agri' via Prisma Client Python.
    """
    try:
        if not prisma_client.is_connected():
            await prisma_client.connect()
            logger.info("Successfully connected to PostgreSQL database 'agri' via Prisma Client Python.")
    except Exception as e:
        logger.error(f"PostgreSQL connection error via Prisma: {e}")

async def disconnect_db():
    """
    Disconnects from PostgreSQL database.
    """
    try:
        if prisma_client.is_connected():
            await prisma_client.disconnect()
            logger.info("Disconnected from PostgreSQL database.")
    except Exception as e:
        logger.error(f"Error disconnecting from PostgreSQL: {e}")
