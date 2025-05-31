from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublicWithAuthor


class CollectionBase(BaseModel):
    name: str = Field(max_length=255)
    description: Optional[str] = None
    is_public: bool = True

    poem_ids: List[uuid.UUID] = []
    
class CollectionBasic(BaseModel): 
    id: uuid.UUID
    name: str = Field(max_length=255)
    description: Optional[str] = None
    is_public: bool = True

    model_config = ConfigDict(from_attributes=True)

class CollectionCreate(CollectionBase):
    user_id: Optional[uuid.UUID] = None

class CollectionUpdate(CollectionBase):
    name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    description: Optional[str] = None  # type: ignore
    is_public: Optional[bool] = None  # type: ignore

    poem_ids: Optional[List[uuid.UUID]] = None # type: ignore


class CollectionSchema(CollectionBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    
    user_id: uuid.UUID
    username: Optional[str] = Field(default=None, max_length=255)
    
    poems: List[PoemPublicWithAuthor] = []
    
    model_config = ConfigDict(from_attributes=True)


class CollectionPublic(CollectionSchema):
    username: Optional[str] = Field(default=None, max_length=255)

class CollectionForSearch(BaseModel): 
    id: uuid.UUID
    name: str = Field(max_length=255)
    user_id: uuid.UUID
    username: str = Field(max_length=255)

    model_config = ConfigDict(from_attributes=True)
