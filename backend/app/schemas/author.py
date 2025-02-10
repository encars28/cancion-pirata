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
    full_name: Optional[str] = Field(max_length=255, default=None) # type: ignore
    birth_date: Optional[datetime] = None
    
class AuthorPublic(AuthorBase): 
    id: uuid.UUID
    
class AuthorsPublic(BaseModel):
    data: list[AuthorPublic]
    count: int
    
class AuthorSchema(AuthorBase): 
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    poems: List[PoemPublic] = []
    
    
    