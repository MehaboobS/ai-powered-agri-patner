from typing import List
from pydantic import BaseModel, Field

class LocationItem(BaseModel):
    id: str = Field(description="Unique location identifier")
    city: str = Field(description="City or district name")
    state: str = Field(description="State name")
    display_name: str = Field(description="Formatted 'City, State' string")
    latitude: float = Field(description="Geographical latitude")
    longitude: float = Field(description="Geographical longitude")
    major_crops: List[str] = Field(default_factory=list, description="Key crops grown in this region")
