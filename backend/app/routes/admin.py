from fastapi import APIRouter, HTTPException, status
from app.schemas.admin import AdminLoginRequest, AdminLoginResponse
from app.services.admin_service import admin_service

admin_router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])

@admin_router.post("/login", response_model=AdminLoginResponse)
async def admin_login(req: AdminLoginRequest):
    """
    Authenticates admin against database seed values (Mehaboob / Mehaboob@123).
    """
    result = await admin_service.authenticate(req.username, req.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials. Please enter the correct Username and Password."
        )

    return AdminLoginResponse(
        success=True,
        message="Admin authentication successful",
        username=result["username"],
        role=result["role"]
    )
