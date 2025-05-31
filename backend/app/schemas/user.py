from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

from app.schemas.author import AuthorPublic


class UserBase(BaseModel):
    email: EmailStr = Field(max_length=255)
    full_name: Optional[str] = Field(max_length=255, default=None)
    username: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

    full_name: Optional[str] = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    username: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: Optional[EmailStr] = Field(default=None, max_length=255)  # type: ignore
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)
    username: Optional[str] = Field(default=None, max_length=255)  # type: ignore
    author_id: Optional[uuid.UUID] = Field(default=None)


class UserUpdateMe(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    username: Optional[str] = Field(default=None, max_length=255)


class UpdatePassword(BaseModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class UserPublic(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: Optional[datetime] = Field(default=datetime.now())
    author_id: Optional[uuid.UUID] = None
    collection_names: list[str] = []


class UserSchema(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: Optional[datetime] = Field(default=datetime.now())
    author_id: Optional[uuid.UUID] = None
    author: Optional[AuthorPublic] = None
    hashed_password: str
    collection_names: list[str] = []


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int


class UserForSearch(BaseModel):
    id: uuid.UUID
    username: str = Field(max_length=255)
    
    model_config = ConfigDict(from_attributes=True)