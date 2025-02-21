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
    author_ids: Optional[List[uuid.UUID]] = None
    
    type: Optional[int] = None
    original_poem_id: Optional[uuid.UUID] = None


class PoemUpdate(PoemBase):
    title: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    content: Optional[str] = None  # type: ignore
    is_public: Optional[bool] = None  # type: ignore
    show_author: Optional[bool] = None  # type: ignore
    language: Optional[str] = None

    author_ids: Optional[List[uuid.UUID]] = None

    type: Optional[int] = None
    original_poem_id: Optional[uuid.UUID] = None


class PoemPublic(PoemBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    

class PoemPublicWithAuthor(PoemPublic):
    author_names: List[str] = []


class PoemPublicWithAuthorAndType(PoemPublicWithAuthor):
    type: Optional[int] = None


class PoemPublicWithAllTheInfo(PoemPublicWithAuthorAndType):
    derived_poems: List[PoemPublicWithAuthorAndType] = []
    original: Optional[PoemPublicWithAuthor] = None


class PoemSchema(PoemBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    
    author_ids: List[uuid.UUID] = []
    author_names: List[str] = []

    type: Optional[int] = None
    derived_poems: List[PoemPublicWithAuthorAndType] = []
    original: Optional[PoemPublicWithAuthorAndType] = None


class PoemsPublic(BaseModel):
    data: List[PoemPublicWithAllTheInfo]
    count: int
