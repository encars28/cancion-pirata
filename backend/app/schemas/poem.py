from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

from app.schemas.author import AuthorPublic

class PoemBase(BaseModel):
    title: str = Field(max_length=255)
    content: str
    is_public: bool = False
    show_author: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None
    
class PoemMeCreate(PoemBase): 
    pass

class PoemCreate(PoemBase): 
    author_id: uuid.UUID

class PoemMeUpdate(PoemBase): 
    title: Optional[str] = Field(max_length=255, default=None) # type: ignore
    content: Optional[str] = None # type: ignore
    is_public: Optional[bool] = None # type: ignore
    show_author: Optional[bool] = None # type: ignore
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    language: Optional[str] = None
    
class PoemUpdate(PoemMeUpdate):
    author_id: Optional[uuid.UUID] = None

class PoemPublic(PoemBase): 
    id: uuid.UUID
    
    author: List[AuthorPublic] = []
    original: Optional["PoemPublic"] = None
    derived_poems: List["PoemPublic"] = []
    
class PoemsPublic(BaseModel): 
    data: list[PoemPublic]
    count: int

class PoemSchema(PoemBase): 
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    
    author: List[AuthorPublic] = []
    original: Optional["PoemPublic"] = None
    derived_poems: List["PoemPublic"] = []
    