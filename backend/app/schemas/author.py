from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, List
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublic

AuthorParam = Literal["full_name", "birth_date", "poems", "death_date"]

class AuthorSearchParams(BaseModel):
    author_order_by: AuthorParam = "full_name"
    author_limit: int = Field(default=100, gt=0, le=100)
    author_skip: int = Field(default=0, ge=0)
    author_desc: bool = False
    author_full_name: str = ""
    author_birth_date: str = ""
    author_death_date: str = ""
    author_poems: str = ""
    author_basic: bool = True


class AuthorBase(BaseModel):
    full_name: str = Field(max_length=255)


class AuthorSchema(AuthorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    birth_date: Optional[datetime] = None
    death_date: Optional[datetime] = None

    poems: List["PoemPublic"] = []
    user_id: Optional[uuid.UUID] = None


class AuthorCreate(AuthorBase):
    birth_date: Optional[datetime] = None
    death_date: Optional[datetime] = None


class AuthorUpdateBasic(BaseModel):
    birth_date: Optional[datetime] = None


class AuthorUpdate(AuthorUpdateBasic):
    full_name: Optional[str] = Field(  # type: ignore
        max_length=255, default=None)
    death_date: Optional[datetime] = None


class AuthorPublicBasic(AuthorBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID

class AuthorPublic(AuthorPublicBasic):
    birth_date: Optional[datetime] = None
    death_date: Optional[datetime] = None
    user_id: Optional[uuid.UUID] = None


class AuthorPublicWithPoems(AuthorPublic):
    poems: List["PoemPublic"] = []


class AuthorsPublic(BaseModel):
    data: list[AuthorPublic]
    count: int


class AuthorsPublicWithPoems(BaseModel):
    data: list[AuthorPublicWithPoems]
    count: int
