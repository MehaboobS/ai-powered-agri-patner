from typing import List, Optional
from pydantic import BaseModel, Field

class Remedies(BaseModel):
    organic: str = Field(description="Regenerative or organic remedy (e.g. neem oil, trichoderma, bio-fungicides)")
    chemical: str = Field(description="Recommended chemical remedy if severe, with safe dosage guidance")
    preventative: str = Field(description="Cultural and preventive practices (spacing, drip irrigation, crop rotation)")

class DiagnosisResult(BaseModel):
    crop_detected: str = Field(description="Name of the detected crop (e.g. Tomato, Rice, Cotton)")
    condition: str = Field(description="Name of the disease or 'Healthy'")
    is_healthy: bool = Field(description="Whether the plant is healthy")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    severity: str = Field(description="Severity level: None, Low, Moderate, High, Severe")
    symptoms: List[str] = Field(description="List of observed visual symptoms")
    remedies: Remedies = Field(description="Actionable treatment and prevention measures")
    advisory_notes: Optional[str] = Field(
        default=None, 
        description="Localised agronomic advice (weather-related or regenerative practices)"
    )
