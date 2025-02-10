from typing import Optional, List
import uuid
from datetime import datetime

from app.core.db import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Column, Uuid, Table

write = Table(
    "write",
    Base.metadata,
    Column("user_id", Uuid, ForeignKey("user.id")),
    Column("author_id", Uuid, ForeignKey("author.id")),
)

class Author(Base): 
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    birth_date: Mapped[Optional[datetime]]
    
    user: Mapped[Optional["User"]] = relationship(back_populates="author") # type: ignore
    poems: Mapped[List["Poem"]] = relationship(secondary=write, back_populates="author") # type: ignore
    
    def __repr__(self) -> str:
        return f"Author(id={self.id!r}, full_name={self.full_name!r})"