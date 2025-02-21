from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublic


class AuthorBase(BaseModel):
    full_name: str = Field(max_length=255)
    birth_date: Optional[datetime] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(AuthorBase):
    full_name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    birth_date: Optional[datetime] = None


class AuthorPublic(AuthorBase):
    id: uuid.UUID


class AuthorPublicWithPoems(AuthorPublic):
    model_config = ConfigDict(from_attributes=True)

    poems: List[PoemPublic] = []


class AuthorSchema(AuthorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    poems: List["PoemPublic"] = []


class AuthorsPublic(BaseModel):
    data: list[AuthorPublicWithPoems]
    count: int
