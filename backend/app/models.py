from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

import uuid

# class Author(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     name: str

#     birth_year: Optional[int]

#     poems: List["Poem"] = Relationship(back_populates="author")
    
#     # https://stackoverflow.com/questions/70759112/one-to-one-relationships-with-sqlmodel
#     user: Optional["User"] = Relationship(sa_relationship_kwargs={'uselist': False}, back_populates="author_info")

# # POEMS

# class PoemCollectionLink(SQLModel, table=True):
#     poem_id: Optional[int] = Field(default=None, foreign_key="poem.id", primary_key=True)
#     collection_id: Optional[int] = Field(default=None, foreign_key="collection.id", primary_key=True)

# class Poem(SQLModel):
#     title: str
#     content: str

#     publication_year: Optional[int]

#     author_id: int = Field(foreign_key="author.id") 
#     author: Author = Relationship(back_populates="poems")

#     collections: List["Collection"] = Relationship(back_populates="poems", link_model=PoemCollectionLink)

# class OriginalPoem(Poem, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     versions: List["PoemVersion"] = Relationship(back_populates="original")
#     translations: List["PoemTranslation"] = Relationship(back_populates="original")

# class PoemVersion(Poem, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     original_id: int = Field(foreign_key="originalpoem.id")
#     original: Poem = Relationship(back_populates="versions")

# class PoemTranslation(Poem, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     original_id: int = Field(foreign_key="originalpoem.id")
#     original: Poem = Relationship(back_populates="translations")

# class Collection(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     title: str

#     publication_year: Optional[int]

#     poems: List[Poem] = Relationship(back_populates="collection", link_model=PoemCollectionLink)

# USER

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)

# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)

class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)

class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str

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
    sub: str | None = None

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
