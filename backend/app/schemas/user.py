from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
import uuid
from datetime import datetime

from app.crud import author
from app.schemas.author import AuthorPublic
from app.schemas.collection import CollectionPublicBasic

UserParam = Literal["full_name", "email", "username"]


class UserSearchParams(BaseModel):
    user_order_by: UserParam = "username"
    user_limit: int = Field(default=100, gt=0, le=100)
    user_skip: int = Field(default=0, ge=0)
    user_desc: bool = False
    user_name: str = ""
    user_email: EmailStr = ""
    user_full_name: str = ""
    user_basic: bool = True


class UserBase(BaseModel):
    email: EmailStr = Field(max_length=255)
    full_name: Optional[str] = Field(max_length=255, default=None)
    username: str = Field(max_length=255)
    is_superuser: bool = Field(default=False)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    username: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: Optional[EmailStr] = Field(  # type: ignore
        default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)
    username: Optional[str] = Field(  # type: ignore
        default=None, max_length=255)
    full_name: Optional[str] = Field(max_length=255, default=None)
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


class UserPublicWithAllTheInfo(UserPublic):
    author: Optional[AuthorPublic] = None
    collections: list[CollectionPublicBasic] = []


class UserSchema(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: Optional[datetime] = Field(default=datetime.now())
    author_id: Optional[uuid.UUID] = None
    author: Optional[AuthorPublic] = None
    hashed_password: str
    collections: list[CollectionPublicBasic] = []
    image_path: Optional[str] = None


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int


class UserPublicBasic(BaseModel):
    id: uuid.UUID
    username: str = Field(max_length=255)

    model_config = ConfigDict(from_attributes=True)
