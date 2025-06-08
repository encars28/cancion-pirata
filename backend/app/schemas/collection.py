from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublic


class CollectionSearchParams(BaseModel):
    collection_limit: int = Field(default=100, gt=0, le=100)
    collection_skip: int = Field(default=0, ge=0)
    collection_desc: bool = False
    collection_name: str = ""
    collection_basic: bool = True


class CollectionBase(BaseModel):
    name: str = Field(max_length=255)
    is_public: bool = True


class CollectionCreate(CollectionBase):
    description: Optional[str] = None
    poem_ids: List[uuid.UUID] = []
    user_id: Optional[uuid.UUID] = None

class CollectionUpdate(CollectionBase):
    name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    description: Optional[str] = None 
    is_public: Optional[bool] = None  # type: ignore

    poem_ids: Optional[List[uuid.UUID]] = None


class CollectionSchema(CollectionBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(default=datetime.now())
    updated_at: Optional[datetime] = Field(default=datetime.now())
    
    user_id: uuid.UUID
    username: Optional[str] = Field(default=None, max_length=255)
    poem_ids: List[uuid.UUID] = []
    poems: List[PoemPublic] = []
    
    model_config = ConfigDict(from_attributes=True)

class CollectionPublicBasic(CollectionBase): 
    id: uuid.UUID
    username: Optional[str] = Field(default=None, max_length=255)

    model_config = ConfigDict(from_attributes=True)
    
class CollectionPublic(CollectionPublicBasic):
    description: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    poems: List[PoemPublic] = []

    
    
class CollectionsPublic(BaseModel):
    count: int
    data: List[CollectionPublic]
    
