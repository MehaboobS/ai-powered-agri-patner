import json
from typing import Optional
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.schemas.diagnosis import DiagnosisResult

class GeminiDiagnosisService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.DEFAULT_MODEL

    def _execute_gemini_call(
        self, 
        image_bytes: bytes, 
        mime_type: str, 
        crop_hint: Optional[str], 
        language: str
    ) -> DiagnosisResult:
        """
        Synchronous call to Google GenAI API with multimodal input and structured schema.
        """
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)

        prompt = f"""
You are an expert agronomy and plant pathology AI designed for Indian smallholder and marginal farmers.
Analyze the provided crop image for plant diseases, nutrient deficiencies, or pests.

Context:
- Suggested Crop Type: {crop_hint if crop_hint else "Detect from image"}
- Preferred Language for remedies and symptoms: {language}

Diagnose accurately. Adhere to regenerative and integrated pest management (IPM) best practices.
Return your response strictly matching the schema format:
- crop_detected: Detected crop name
- condition: Disease or pest name, or "Healthy" if no disease
- is_healthy: true if healthy, false otherwise
- confidence: Float 0.0 to 1.0
- severity: "None", "Low", "Moderate", "High", or "Severe"
- symptoms: Array of key visual symptoms
- remedies: Object with:
    - organic: Natural, organic, or biological control remedies (e.g. neem oil, bio-agents, compost tea)
    - chemical: Chemical intervention if disease is moderate or severe, with safety warnings
    - preventative: Long-term agronomic prevention (crop rotation, spacing, soil health)
- advisory_notes: Brief regional/climate resilience advice.
"""

        response = client.models.generate_content(
            model=self.model,
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type or "image/jpeg"
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DiagnosisResult,
                temperature=0.2
            )
        )

        result_dict = json.loads(response.text)
        return DiagnosisResult(**result_dict)

    async def diagnose(
        self, 
        image_bytes: bytes, 
        mime_type: str, 
        crop_hint: Optional[str], 
        language: str
    ) -> DiagnosisResult:
        """
        Asynchronously executes the Gemini vision diagnosis offloaded to a threadpool.
        """
        return await run_in_threadpool(
            self._execute_gemini_call,
            image_bytes=image_bytes,
            mime_type=mime_type,
            crop_hint=crop_hint,
            language=language
        )

gemini_service = GeminiDiagnosisService()
