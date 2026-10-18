from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.db import connect_db, disconnect_db
from app.middleware.cors import setup_cors_middleware
from app.routes import api_router
from app.services.admin_service import admin_service
from app.services.scheme_service import scheme_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to PostgreSQL via Prisma
    await connect_db()
    # Seed default admin (Mehaboob / Mehaboob@123) if not present
    try:
        await admin_service.seed_default_admin()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Admin seed skipped/failed: %s", e)
    # Seed government schemes into PostgreSQL
    try:
        await scheme_service.seed_default_schemes()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Scheme seed skipped/failed: %s", e)
    yield
    # Disconnect from PostgreSQL on shutdown
    await disconnect_db()

def create_app() -> FastAPI:
    """
    Application factory for the Bharath Digital Agriculture API.
    """
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.PROJECT_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # Middleware Setup
    setup_cors_middleware(application, settings.ALLOWED_ORIGINS)

    # Router Registration
    application.include_router(api_router)

    return application

app = create_app()
