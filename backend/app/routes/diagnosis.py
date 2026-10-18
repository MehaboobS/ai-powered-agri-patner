from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from app.controllers.diagnosis_controller import diagnosis_controller
from app.schemas.diagnosis import DiagnosisResult

router = APIRouter(prefix="/api", tags=["Diagnosis"])

@router.post("/diagnose", response_model=DiagnosisResult)
async def diagnose_crop(
    file: UploadFile = File(..., description="Crop leaf image file (JPEG/PNG/WEBP)"),
    crop_type: Optional[str] = Form(None, description="Optional crop name hint (e.g., Rice, Tomato, Cotton)"),
    language: Optional[str] = Form("English", description="Response language (e.g., English, Hindi, Telugu, Tamil, Kannada)")
):
    """
    Diagnose crop leaf disease from an uploaded image.
    Returns disease classification, severity, visual symptoms, and organic/chemical remedies.
    """
    return await diagnosis_controller.process_diagnosis(
        file=file,
        crop_type=crop_type,
        language=language
    )
