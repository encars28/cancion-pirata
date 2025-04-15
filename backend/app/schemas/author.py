from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublic


class AuthorBase(BaseModel):
    full_name: str = Field(max_length=255)
    birth_date: Optional[datetime] = None

class AuthorSchema(AuthorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    poems: List["PoemPublic"] = []


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(AuthorBase):
    full_name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    birth_date: Optional[datetime] = None


class AuthorPublicBasic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    full_name: str = Field(max_length=255)


class AuthorPublic(AuthorBase): 
    id: uuid.UUID


class AuthorPublicWithPoems(AuthorSchema):
    pass


class AuthorsPublic(BaseModel):
    data: list[AuthorPublicBasic]
    count: int


class AuthorsPublicWithPoems(BaseModel):
    data: list[AuthorPublicWithPoems]
    count: int
