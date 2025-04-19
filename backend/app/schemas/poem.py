from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime


class PoemBase(BaseModel):
    title: str = Field(max_length=255)
    content: str
    is_public: bool = False
    show_author: bool = True
    language: Optional[str] = None


class PoemCreate(PoemBase):
    type: Optional[int] = None
    original_poem_id: Optional[uuid.UUID] = None
    author_names: Optional[List[str]] = None

class PoemUpdate(PoemBase):
    title: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    content: Optional[str] = None  # type: ignore
    is_public: Optional[bool] = None  # type: ignore
    show_author: Optional[bool] = None  # type: ignore
    language: Optional[str] = None

    author_names: Optional[List[str]] = None
    type: Optional[int] = None
    original_poem_id: Optional[uuid.UUID] = None

class PoemPublicBasic(BaseModel):
    id: uuid.UUID
    title: str = Field(max_length=255)
    
    model_config = ConfigDict(from_attributes=True)


class PoemPublicBasicWithAuthor(PoemPublicBasic):
    author_names: List[str] = []


# Used for showing poem info in author
class PoemPublic(PoemPublicBasic):
    model_config = ConfigDict(from_attributes=True)
    language: Optional[str] = None
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    type: Optional[int] = None
    is_public: bool = False
    show_author: bool = True


class PoemPublicWithAuthor(PoemPublic):
    author_names: List[str] = []

class PoemPublicWithAllTheInfo(PoemPublicWithAuthor):
    content: str
    derived_poems: List[PoemPublicBasicWithAuthor] = []
    original: Optional[PoemPublicBasicWithAuthor] = None


class PoemSchema(PoemBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())

    author_ids: List[uuid.UUID] = []
    author_names: List[str] = []

    type: Optional[int] = None
    derived_poems: List[PoemPublicWithAuthor] = []
    original: Optional[PoemPublicWithAuthor] = None


class PoemsPublicBasic(BaseModel):
    data: List[PoemPublicBasic]
    count: int


class PoemsPublic(BaseModel):
    data: List[PoemPublicWithAuthor]
    count: int
