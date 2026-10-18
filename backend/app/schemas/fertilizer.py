from typing import List, Optional
from pydantic import BaseModel, Field

class CommercialFertilizer(BaseModel):
    name: str = Field(description="Commercial fertilizer name e.g. Urea (46% N)")
    bag_weight_kg: float = Field(description="Standard bag weight in kg (45kg or 50kg)")
    bags_required: float = Field(description="Calculated quantity of standard bags")
    total_kg: float = Field(description="Total weight required in kilograms")
    price_per_bag: float = Field(description="Subsidized MRP per bag in Indian Rupees (₹)")
    total_cost: float = Field(description="Total calculated cost in ₹")

class NutrientRequirement(BaseModel):
    nitrogen_kg: float = Field(description="Pure Nitrogen (N) required in kg")
    phosphorus_kg: float = Field(description="Pure Phosphate (P2O5) required in kg")
    potassium_kg: float = Field(description="Pure Potash (K2O) required in kg")

class OrganicRecommendation(BaseModel):
    farmyard_manure_tons: float = Field(description="Well decomposed Farmyard Manure (FYM) in tonnes")
    vermicompost_kg: float = Field(description="Vermicompost requirement in kg")
    neem_cake_kg: float = Field(description="Neem cake requirement in kg for pest deterrent & nitrogen nitrification inhibition")
    biofertilizers: List[str] = Field(description="Recommended bacterial inoculants (e.g. Azotobacter, PSB, KMB)")
    benefits: str = Field(description="Soil health and organic matter benefits")

class ApplicationSchedule(BaseModel):
    stage_name: str = Field(description="Stage e.g. Basal / At Sowing, Vegetative Top-Dress")
    timing: str = Field(description="Agronomic timing e.g. 0-5 DAT, 25-30 DAT")
    urea_split_percent: int = Field(description="Percentage of Urea to apply at this stage")
    dap_split_percent: int = Field(description="Percentage of DAP to apply at this stage")
    mop_split_percent: int = Field(description="Percentage of MOP to apply at this stage")
    instructions: str = Field(description="Method of application e.g. Soil incorporation, Fertigation, Ring placement")

class FertilizerCalculateRequest(BaseModel):
    crop_name: str = Field(default="Tomato", description="Crop name (Tomato, Rice / Paddy, Wheat, Cotton, Maize, Potato, Chilli, Soybean, Groundnut)")
    land_area: float = Field(default=1.0, ge=0.01, description="Numerical farm land area")
    area_unit: str = Field(default="Acres", description="Land area unit: 'Acres', 'Guntas', 'Bighas', 'Hectares'")
    growth_stage: str = Field(default="Full Season / Recommended POP", description="Growth stage: 'Full Season / Recommended POP', 'Basal / Sowing', 'Vegetative / Tillering', 'Flowering / Pre-Bloom', 'Fruiting / Grain Filling'")

class FertilizerCalculateResponse(BaseModel):
    crop_name: str
    land_area: float
    area_unit: str
    normalized_acres: float
    growth_stage: str
    nutrients: NutrientRequirement
    commercial_fertilizers: List[CommercialFertilizer]
    organic_alternatives: OrganicRecommendation
    schedules: List[ApplicationSchedule]
    total_estimated_cost: float
    safety_tips: List[str]

class SaveFertilizerPlanRequest(BaseModel):
    crop_name: str
    land_area: float
    area_unit: str
    growth_stage: str
    nitrogen_kg: float
    phosphorus_kg: float
    potassium_kg: float
    urea_bags: float
    dap_bags: float
    mop_bags: float
    fym_tons: float
    vermicompost_kg: float
    estimated_cost: float

class FertilizerPlanRecord(BaseModel):
    id: str
    crop_name: str
    land_area: float
    area_unit: str
    growth_stage: str
    nitrogen_kg: float
    phosphorus_kg: float
    potassium_kg: float
    urea_bags: float
    dap_bags: float
    mop_bags: float
    fym_tons: float
    vermicompost_kg: float
    estimated_cost: float
    created_at: str
