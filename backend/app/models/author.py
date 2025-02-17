from typing import Optional, List
import uuid
from datetime import datetime

from app.core.base_class import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Column, Uuid, Table

class Author(Base): 
    __tablename__ = "author"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    birth_date: Mapped[Optional[datetime]]
    
    user: Mapped[Optional["User"]] = relationship(back_populates="author") # type: ignore
    poems: Mapped[List["Poem"]] = relationship(  # type: ignore
        secondary="author_poem", 
        back_populates="authors",
        cascade="all, delete"
    )
    
author_poem = Table(
    "author_poem",
    Base.metadata,
    Column("poem_id", Uuid, ForeignKey("poem.id"), primary_key=True),
    Column("author_id", Uuid, ForeignKey("author.id"), primary_key=True),
)

