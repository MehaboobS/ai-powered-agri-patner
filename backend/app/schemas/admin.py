from pydantic import BaseModel, Field

class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, description="Admin username")
    password: str = Field(min_length=1, description="Admin password")

class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    username: str
    role: str
