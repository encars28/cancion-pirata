from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime


class CollectionBase(BaseModel):
    name: str = Field(max_length=255)
    description: str
    is_public: bool = False

    poem_ids: List[uuid.UUID] = []

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(CollectionBase):
    name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    description: Optional[str] = None  # type: ignore
    is_public: Optional[bool] = None  # type: ignore

    poem_ids: Optional[List[uuid.UUID]] = None # type: ignore


class CollectionSchema(CollectionBase):
    id: uuid.UUID
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    
    model_config = ConfigDict(from_attributes=True)


class CollectionPublic(CollectionSchema):
    pass

