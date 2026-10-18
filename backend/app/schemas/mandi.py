from typing import List, Optional
from pydantic import BaseModel, Field

class MandiItem(BaseModel):
    crop_name: str = Field(description="Commodity name e.g. Tomato, Onion, Cotton")
    market_name: str = Field(description="APMC Mandi Yard e.g. Kolar APMC, Azadpur, Guntur Yard")
    state: str = Field(description="State and district location")
    distance_km: Optional[float] = Field(default=None, description="Distance from the farmer's location in kilometers")
    min_price: float = Field(description="Minimum trading price")
    max_price: float = Field(description="Maximum trading price")
    modal_price: float = Field(description="Modal or average price")
    unit: str = Field(default="₹/kg", description="Pricing unit (e.g., ₹/kg, ₹/quintal)")
    trend: str = Field(description="'Rising', 'Falling', or 'Stable'")
    trend_percentage: Optional[float] = Field(default=None, description="Price change percentage e.g. 5.2")
    arrival_volume: str = Field(description="Estimated daily arrival volume e.g. '1,200 Quintals'")
    recommendation: str = Field(description="Agronomic and economic selling advice")

class MandiSearchRequest(BaseModel):
    query: Optional[str] = Field(default=None, description="Voice transcript or text query from farmer")
    crops: Optional[List[str]] = Field(default=None, description="Direct list of crop names")
    language: str = Field(default="English", description="Target language: English, Hindi, Telugu, Tamil, Kannada, Marathi")
    city: Optional[str] = Field(default=None, description="Farmer selected City name e.g. Bengaluru, Kolar, Nashik")
    state: Optional[str] = Field(default=None, description="Preferred state / district filter")
    latitude: Optional[float] = Field(default=None, description="Farmer's farm latitude coordinate")
    longitude: Optional[float] = Field(default=None, description="Farmer's farm longitude coordinate")

class MandiSearchResponse(BaseModel):
    query_analyzed: str
    language: str
    farmer_location: Optional[str] = Field(default=None, description="Detected or configured farmer location")
    items: List[MandiItem]
    spoken_summary: str = Field(
        description="Natural language market summary in the requested language for TTS playback, with numbers written as digits (e.g. 1, 2, 3)"
    )
