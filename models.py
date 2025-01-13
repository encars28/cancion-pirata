from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    birth_year: Optional[int]

    poems: List["Poem"] = Relationship(back_populates="author")

class PoemCollectionLink(SQLModel, table=True):
    poem_id: Optional[int] = Field(default=None, foreign_key="poem.id", primary_key=True)
    collection_id: Optional[int] = Field(default=None, foreign_key="collection.id", primary_key=True)
    
class Poem(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str

    publication_year: Optional[int]

    author_id: int = Field(foreign_key="author.id") 
    author: Author = Relationship(back_populates="poems")

    collections: List["Collection"] = Relationship(back_populates="poems", link_model=PoemCollectionLink)

class OriginalPoem(Poem, table=True):
    versions: List["PoemVersion"] = Relationship(back_populates="original")
    translations: List["PoemTranslation"] = Relationship(back_populates="original")

class PoemVersion(Poem, table=True):
    original_id: int = Field(foreign_key="poem.id")
    original: Poem = Relationship(back_populates="versions")

class PoemTranslation(Poem, table=True):
    original_id: int = Field(foreign_key="poem.id")
    original: Poem = Relationship(back_populates="translations")

class Collection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    publication_year: Optional[int]

    poems: List[Poem] = Relationship(back_populates="collection", link_model=PoemCollectionLink)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    password: str

    # if this were to become a many-to-many relationship, (several roles
    # per user), we would need to create a new table for this relationship
    # For now the only roles are "user" and "admin"
    role: str = Field(default="user")	