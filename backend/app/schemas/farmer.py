from typing import List, Optional
from pydantic import BaseModel, Field

class FarmerRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100, description="Farmer's full name")
    phone_number: Optional[str] = Field(default=None, description="Optional 10-digit mobile phone number")
    language: str = Field(default="English", description="Chosen regional language e.g. English, Hindi, Kannada, etc.")
    state: Optional[str] = Field(default=None, description="State of farm")
    city: Optional[str] = Field(default=None, description="City/district of farm")
    latitude: Optional[float] = Field(default=None, description="Automatically detected GPS latitude")
    longitude: Optional[float] = Field(default=None, description="Automatically detected GPS longitude")

class FarmerResponse(BaseModel):
    id: str
    name: str
    phone_number: Optional[str] = None
    language: str
    state: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: str

class FarmerListResponse(BaseModel):
    total: int
    farmers: List[FarmerResponse]
