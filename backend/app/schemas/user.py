from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr = Field(max_length=255)
    full_name: Optional[str] = Field(max_length=255)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    full_name: Optional[str] = Field(default=None, max_length=255)
    created_at: Optional[datetime] = Field(default=None)
    
    author_id: Optional[uuid.UUID] = Field(default=None)
    
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)
    
class UserRegister(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: Optional[str] = Field(default=None, max_length=255)
    
class UserUpdate(UserBase):
    email: Optional[EmailStr] = Field(default=None, max_length=255) # type: ignore
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)
    author_id: Optional[uuid.UUID] = Field(default=None)
    
class UserUpdateMe(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    
class UpdatePassword(BaseModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

class UserPublic(UserBase):
    id: uuid.UUID

class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int
    
class UserSchema(UserBase): 
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    