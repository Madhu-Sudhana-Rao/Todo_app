import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

class UpdatePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=128)

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
