from typing import Optional, List
import uuid
from datetime import datetime

from app.core.base_class import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Column, Uuid, Table
from app.models.poem import Poem

class Author(Base): 
    __tablename__ = "author"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    birth_date: Mapped[Optional[datetime]]
    
    user: Mapped[Optional["User"]] = relationship(back_populates="author") # type: ignore
    poems: Mapped[List["Poem"]] = relationship(secondary="author_poem", back_populates="authors") # type: ignore
    
    def __repr__(self) -> str:
        return f"Author(id={self.id!r}, full_name={self.full_name!r})"
    
author_poem = Table(
    "author_poem",
    Base.metadata,
    Column("poem_id", Uuid, ForeignKey("poem.id"), primary_key=True),
    Column("author_id", Uuid, ForeignKey("author.id"), primary_key=True),
)

