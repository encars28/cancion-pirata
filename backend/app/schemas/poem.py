from __future__ import annotations
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

class PoemType(Enum): 
    TRANSLATION = 0
    VERSION = 1

# POEM 

class PoemBase(BaseModel):
    title: str = Field(max_length=255)
    content: str
    is_public: bool = False
    show_author: bool = True
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None
    
class PoemCreate(PoemBase): 
    author_ids: Optional[List[uuid.UUID]] = None
    type: Optional[int] = None
    original_id: Optional[uuid.UUID] = None 

class PoemUpdate(PoemBase): 
    title: Optional[str] = Field(max_length=255, default=None) # type: ignore
    content: Optional[str] = None # type: ignore
    is_public: Optional[bool] = None # type: ignore
    show_author: Optional[bool] = None # type: ignore
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None
    author_ids: Optional[List[uuid.UUID]] = None 
    type: Optional[int] = None
    original_id: Optional[uuid.UUID] = None 

class PoemPublic(PoemBase): 
    id: uuid.UUID

class PoemPublicWithAuthorNames(PoemPublic): 
    author_names: List[str] = []

class PoemPublicWithDerivedAndOriginal(PoemPublicWithAuthorNames):
    model_config = ConfigDict(from_attributes=True)
    derived_poems: List[PoemPoemPublicWithDerived] = []
    original: Optional[PoemPoemPublicWithOriginal] = None
    
class PoemSchema(PoemBase): 
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    
class PoemsPublic(BaseModel): 
    data: List[PoemPublicWithDerivedAndOriginal]
    count: int
    
# POEM_POEM

class PoemPoemBase(BaseModel):
    type: int
    
class PoemPoemCreate(PoemPoemBase): 
    original_id: uuid.UUID
    derived_poem_id: uuid.UUID

class PoemPoemUpdate(PoemPoemBase): 
    original_id: Optional[uuid.UUID] = None # type: ignore
    derived_poem_id: Optional[uuid.UUID] = None # type: ignore
    type: Optional[int] = None # type: ignore

class PoemPoemPublicWithOriginal(PoemPoemBase):
    original_poem: PoemPublic
    
class PoemPoemPublicWithDerived(PoemPoemBase):
    derived_poem: PoemPublic
    
class PoemPoemSchema(PoemPoemBase): 
    model_config = ConfigDict(from_attributes=True)
    original_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    derived_poem_id: uuid.UUID
    