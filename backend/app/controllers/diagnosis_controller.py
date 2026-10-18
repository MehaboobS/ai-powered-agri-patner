import logging
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings
from app.helpers.image_helper import validate_and_process_image
from app.services.gemini_service import gemini_service
from app.services.mock_service import mock_service
from app.schemas.diagnosis import DiagnosisResult

from app.core.db import prisma_client

logger = logging.getLogger(__name__)

class DiagnosisController:
    async def process_diagnosis(
        self,
        file: UploadFile,
        crop_type: Optional[str] = None,
        language: Optional[str] = "English"
    ) -> DiagnosisResult:
        """
        Orchestrates image validation, model invocation, and fallback handling,
        and saves diagnostic scan history to PostgreSQL via Prisma.
        """
        image_bytes = await file.read()
        detected_mime = validate_and_process_image(
            file=file, 
            image_bytes=image_bytes, 
            max_size_bytes=settings.MAX_IMAGE_SIZE_BYTES
        )

        api_key = settings.GEMINI_API_KEY
        result: DiagnosisResult
        if api_key and api_key.strip():
            try:
                result = await gemini_service.diagnose(
                    image_bytes=image_bytes,
                    mime_type=detected_mime,
                    crop_hint=crop_type,
                    language=language
                )
            except Exception as e:
                logger.error(f"Error during Gemini inference: {str(e)}", exc_info=True)
                result = mock_service.get_mock_diagnosis(
                    crop_hint=crop_type,
                    advisory_notes=f"AI API Error ({str(e)}). Displaying reference diagnosis."
                )
        else:
            result = mock_service.get_mock_diagnosis(crop_hint=crop_type)

        # Save scan history to PostgreSQL via Prisma
        if prisma_client.is_connected():
            try:
                await prisma_client.diagnosisscan.create(
                    data={
                        "crop_type": result.detected_crop or crop_type,
                        "disease_name": result.disease_name,
                        "confidence": float(result.confidence),
                        "severity": result.severity,
                        "language": language or "English"
                    }
                )
            except Exception as e:
                logger.warning(f"Could not persist scan to PostgreSQL: {e}")

        return result

diagnosis_controller = DiagnosisController()
