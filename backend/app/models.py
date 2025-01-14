from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    birth_year: Optional[int]

    poems: List["Poem"] = Relationship(back_populates="author")
    
    # https://stackoverflow.com/questions/70759112/one-to-one-relationships-with-sqlmodel
    user: Optional["User"] = Relationship(sa_relationship_kwargs={'uselist': False}, back_populates="author_info")


class PoemCollectionLink(SQLModel, table=True):
    poem_id: Optional[int] = Field(default=None, foreign_key="poem.id", primary_key=True)
    collection_id: Optional[int] = Field(default=None, foreign_key="collection.id", primary_key=True)

class Poem(SQLModel):
    title: str
    content: str

    publication_year: Optional[int]

    author_id: int = Field(foreign_key="author.id") 
    author: Author = Relationship(back_populates="poems")

    collections: List["Collection"] = Relationship(back_populates="poems", link_model=PoemCollectionLink)

class OriginalPoem(Poem, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    versions: List["PoemVersion"] = Relationship(back_populates="original")
    translations: List["PoemTranslation"] = Relationship(back_populates="original")

class PoemVersion(Poem, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    original_id: int = Field(foreign_key="originalpoem.id")
    original: Poem = Relationship(back_populates="versions")

class PoemTranslation(Poem, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    original_id: int = Field(foreign_key="originalpoem.id")
    original: Poem = Relationship(back_populates="translations")

class Collection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str

    publication_year: Optional[int]

    poems: List[Poem] = Relationship(back_populates="collection", link_model=PoemCollectionLink)

class UserBase(SQLModel):
    username: str = Field(unique=True, max_length=255)
    email: EmailStr = Field(unique=True, max_length=255)
    full_name: Optional[str] = Field(max_length=255)

    is_admin: bool = False

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    author_id: Optional[int] = Field(foreign_key="author.id")
    author_info: Optional[Author] = Relationship(back_populates="user")
