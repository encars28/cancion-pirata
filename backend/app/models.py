from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

import uuid

# AUTHOR

class Author(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    birth_year: Optional[int]

    original_poems: List["OriginalPoem"] = Relationship(back_populates="author")
    versions: List["PoemVersion"] = Relationship(back_populates="author")
    translations: List["PoemTranslation"] = Relationship(back_populates="author")
    
    # https://stackoverflow.com/questions/70759112/one-to-one-relationships-with-sqlmodel
    user: Optional["User"] = Relationship(sa_relationship_kwargs={'uselist': False}, back_populates="author_info")

# POEMS

class OriginalPoemCollectionLink(SQLModel, table=True):
    poem_id: Optional[uuid.UUID] = Field(default=None, foreign_key="originalpoem.id", primary_key=True)
    collection_id: Optional[uuid.UUID] = Field(default=None, foreign_key="collection.id", primary_key=True)
    
class PoemVersionCollectionLink(SQLModel, table=True):
    poem_id: Optional[uuid.UUID] = Field(default=None, foreign_key="poemversion.id", primary_key=True)
    collection_id: Optional[uuid.UUID] = Field(default=None, foreign_key="collection.id", primary_key=True)
    
class PoemTranslationCollectionLink(SQLModel, table=True):
    poem_id: Optional[uuid.UUID] = Field(default=None, foreign_key="poemtranslation.id", primary_key=True)
    collection_id: Optional[uuid.UUID] = Field(default=None, foreign_key="collection.id", primary_key=True)
    
class Collection(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str

    publication_year: Optional[int]

    original_poems: List["OriginalPoem"] = Relationship(back_populates="collections", link_model=OriginalPoemCollectionLink)
    versions: List["PoemVersion"] = Relationship(back_populates="collections", link_model=PoemVersionCollectionLink)
    translations: List["PoemTranslation"] = Relationship(back_populates="collections", link_model=PoemTranslationCollectionLink)

# Shared properties
class Poem(SQLModel):
    title: str
    content: str

    publication_year: Optional[int]

class OriginalPoem(Poem, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    versions: List["PoemVersion"] = Relationship(back_populates="original")
    translations: List["PoemTranslation"] = Relationship(back_populates="original")
    
    author_id: Optional[uuid.UUID] = Field(foreign_key="author.id") 
    author: Optional[Author] = Relationship(back_populates="original_poems")
    
    collections: List[Collection] = Relationship(back_populates="original_poems", link_model=OriginalPoemCollectionLink)

class PoemVersion(Poem, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    original_id: uuid.UUID = Field(foreign_key="originalpoem.id")
    original: OriginalPoem = Relationship(back_populates="versions")
    
    author_id: Optional[uuid.UUID] = Field(foreign_key="author.id") 
    author: Optional[Author] = Relationship(back_populates="versions")

    collections: List[Collection] = Relationship(back_populates="versions", link_model=PoemVersionCollectionLink)

class PoemTranslation(Poem, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    original_id: uuid.UUID = Field(foreign_key="originalpoem.id")
    original: OriginalPoem = Relationship(back_populates="translations")
    
    author_id: Optional[uuid.UUID] = Field(foreign_key="author.id") 
    author: Optional[Author] = Relationship(back_populates="translations")

    collections: List[Collection] = Relationship(back_populates="translations", link_model=PoemTranslationCollectionLink)

# USER

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: Optional[str] = Field(default=None, max_length=255)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: Optional[str] = Field(default=None, max_length=255)

# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: Optional[EmailStr] = Field(default=None, max_length=255)  # type: ignore
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)

class UserUpdateMe(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = Field(default=None, max_length=255)

class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    
    author_id: Optional[uuid.UUID] = Field(default=None, foreign_key="author.id")
    author_info: Optional[Author] = Relationship(back_populates="user")

# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID

class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

# OTROS 

# Generic message
class Message(SQLModel):
    message: str

# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# Contents of JWT token
class TokenPayload(SQLModel):
    sub: Optional[str] = None

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
