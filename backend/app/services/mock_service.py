from typing import Optional
from app.schemas.diagnosis import DiagnosisResult, Remedies

class MockDiagnosisService:
    @staticmethod
    def get_mock_diagnosis(crop_hint: Optional[str] = None, advisory_notes: Optional[str] = None) -> DiagnosisResult:
        crop = crop_hint.capitalize() if crop_hint else "Tomato"
        default_notes = (
            advisory_notes 
            if advisory_notes 
            else "[Mock Mode] Set GEMINI_API_KEY in backend/.env to enable live multi-modal AI vision diagnosis."
        )

        return DiagnosisResult(
            crop_detected=crop,
            condition="Early Blight (Alternaria solani)",
            is_healthy=False,
            confidence=0.92,
            severity="Moderate",
            symptoms=[
                "Brown to dark spots with concentric rings (target board pattern) on older leaves",
                "Yellowing (chlorosis) of the leaf tissue surrounding the spots",
                "Leaf wilting and premature defoliation on lower canopy"
            ],
            remedies=Remedies(
                organic="Spray diluted cold-pressed Neem Oil (5ml/L) or Trichoderma viride bio-fungicide (5g/L) during early morning or late evening every 7 days.",
                chemical="Apply Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L as a protective foliar spray.",
                preventative="Maintain adequate plant spacing (60cm x 45cm) for air circulation, avoid overhead sprinkler irrigation, and mulch the base to prevent soil splash."
            ),
            advisory_notes=default_notes
        )

mock_service = MockDiagnosisService()
