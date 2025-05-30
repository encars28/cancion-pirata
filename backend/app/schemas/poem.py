from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, List
import uuid
from datetime import datetime
from enum import Enum

PoemParam = Literal["created_at", "updated_at", "title"]
PoemParamType = Literal["all", "version", "translation", "derived", "original", ""]


class PoemBase(BaseModel):
    title: str = Field(max_length=255)
    content: str
    description: Optional[str] = None
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


# Used for showing poem info in author
class PoemPublic(BaseModel):
    id: uuid.UUID
    title: str = Field(max_length=255)
    description: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    type: Optional[int] = None
    is_public: bool = False
    show_author: bool = True

    model_config = ConfigDict(from_attributes=True)


class PoemPublicWithAuthor(PoemPublic):
    author_names: List[str] = []
    author_ids: List[uuid.UUID] = []


class PoemPublicWithAllTheInfo(PoemPublicWithAuthor):
    content: str
    derived_poems: List[PoemPublicWithAuthor] = []
    original: Optional[PoemPublicWithAuthor] = None


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


class PoemsPublic(BaseModel):
    data: List[PoemPublicWithAuthor]
    count: int


class PoemSearchParams(BaseModel):
    order_by: PoemParam = "title"
    limit: int = Field(default=100, gt=0, le=100)
    skip: int = Field(default=0, ge=0)
    desc: bool = False
    title: str = ""
    created_at: str = ""
    updated_at: str = ""
    verses: str = ""
    type: PoemParamType = ""
    language: str = ""


class PoemForSearch(BaseModel): 
    id: uuid.UUID
    title: str = Field(max_length=255)
    author_names: List[str] = []
    
    model_config = ConfigDict(from_attributes=True)


class PoemType(Enum):
    TRANSLATION = 0
    VERSION = 1


class PoemPoemBase(BaseModel):
    type: int


class PoemPoemCreate(PoemPoemBase):
    original_poem_id: uuid.UUID
    derived_poem_id: uuid.UUID


class PoemPoemUpdate(PoemPoemBase):
    original_poem_id: Optional[uuid.UUID] = None  # type: ignore
    derived_poem_id: Optional[uuid.UUID] = None  # type: ignore
    type: Optional[int] = None  # type: ignore


class PoemPoemSchema(PoemPoemBase):
    model_config = ConfigDict(from_attributes=True)
    original_poem_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    derived_poem_id: uuid.UUID