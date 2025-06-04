from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, List
import uuid
from datetime import datetime

from app.schemas.poem import PoemPublic

AuthorParam = Literal["full_name", "birth_date", "poems", "death_date"]

class AuthorBase(BaseModel):
    full_name: str = Field(max_length=255)
    birth_date: Optional[datetime] = None
    death_date: Optional[datetime] = None


class AuthorSchema(AuthorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    poems: List["PoemPublic"] = []
    user_id: Optional[uuid.UUID] = None
    image_path: Optional[str] = Field(default=None, max_length=255)


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(AuthorBase):
    full_name: Optional[str] = Field(max_length=255, default=None)  # type: ignore
    birth_date: Optional[datetime] = None


class AuthorPublicBasic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str = Field(max_length=255)


class AuthorPublic(AuthorBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None


class AuthorPublicWithPoems(AuthorPublic):
    poems: List["PoemPublic"] = []


class AuthorsPublic(BaseModel):
    data: list[AuthorPublicBasic]
    count: int


class AuthorsPublicWithPoems(BaseModel):
    data: list[AuthorPublicWithPoems]
    count: int
    
    
class AuthorForSearch(AuthorPublicBasic): 
    pass


class AuthorSearchParams(BaseModel):
    order_by: AuthorParam = "full_name"
    limit: int = Field(default=100, gt=0, le=100)
    skip: int = Field(default=0, ge=0)
    desc: bool = False
    full_name: str = ""
    birth_date: str = ""
    death_date: str = ""
    poems: str = ""
    