from typing import List, Optional
from pydantic import BaseModel, Field

class SchemeOut(BaseModel):
    id: str
    code: str
    name: str
    short_name: str
    category: str
    implementing_agency: str
    benefit_summary: str
    financial_benefit_max: Optional[float] = None
    subsidy_percentage: Optional[float] = None
    target_crops: List[str] = []
    min_land_acres: Optional[float] = None
    max_land_acres: Optional[float] = None
    farmer_categories: List[str] = []
    state_applicability: List[str] = []
    description: str
    key_eligibility: List[str] = []
    required_documents: List[str] = []
    application_steps: List[str] = []
    official_portal_url: str
    helpline_number: str
    created_at: Optional[str] = None

class EligibilityCheckRequest(BaseModel):
    land_area: float = Field(..., gt=0, description="Size of land holding")
    area_unit: str = Field(default="Acres", description="Acres, Guntas, Hectares, Bighas")
    crop_name: Optional[str] = Field(default=None, description="Primary crop cultivated")
    state: Optional[str] = Field(default="All-India", description="State of farm")
    farmer_category: Optional[str] = Field(default=None, description="Marginal, Small, Medium, Large")
    seeking_subsidies: Optional[List[str]] = Field(default=[], description="Irrigation, Machinery, Solar, Loan, Insurance, Income")

class SchemeMatchResult(BaseModel):
    scheme: SchemeOut
    is_eligible: bool
    match_score: int
    match_reasons: List[str]
    estimated_financial_benefit: float
    subsidy_text: str

class EligibilityCheckResponse(BaseModel):
    total_schemes_evaluated: int
    eligible_schemes_count: int
    total_estimated_benefit_inr: float
    land_in_acres: float
    farmer_tier: str
    results: List[SchemeMatchResult]

class SaveSchemeRequest(BaseModel):
    farmer_id: str
    scheme_id: str

class SavedSchemeResponse(BaseModel):
    id: str
    farmer_id: str
    scheme_id: str
    scheme_code: str
    scheme_name: str
    status: str
    created_at: str
