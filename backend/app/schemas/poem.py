from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

from app.schemas.author import AuthorPublic

class PoemPoemBase(BaseModel):
    original_id: uuid.UUID
    derived_poem_id: uuid.UUID
    type: int
    
class PoemPoemCreate(PoemPoemBase): 
    pass

class PoemPoemUpdate(PoemPoemBase): 
    original_id: Optional[uuid.UUID] = None # type: ignore
    derived_poem_id: Optional[uuid.UUID] = None # type: ignore
    type: Optional[int] = None # type: ignore
    
class PoemPoemSchema(PoemPoemBase): 
    model_config = ConfigDict(from_attributes=True)
    
# class PoemPoemSchemaPublic(BaseModel): 
#     original: PoemPublic
#     derived_poem_id: PoemPublic
#     type: int
    
class PoemBase(BaseModel):
    title: str = Field(max_length=255)
    content: str
    is_public: bool = False
    show_author: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None
    
class PoemCreate(PoemBase): 
    pass

class PoemUpdate(PoemBase): 
    title: Optional[str] = Field(max_length=255, default=None) # type: ignore
    content: Optional[str] = None # type: ignore
    is_public: Optional[bool] = None # type: ignore
    show_author: Optional[bool] = None # type: ignore
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None

class PoemPublic(PoemBase): 
    id: uuid.UUID
    
    author: List[AuthorPublic] = []
    original: Optional[PoemPoemSchema] = None
    derived_poems: List[PoemPoemSchema] = []
    
class PoemsPublic(BaseModel): 
    data: list[PoemPublic]
    count: int

class PoemSchema(PoemBase): 
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    
    author: List[AuthorPublic] = []
    original: Optional[PoemPoemSchema] = None
    derived_poems: List[PoemPoemSchema] = []
    