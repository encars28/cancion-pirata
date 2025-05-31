from typing import Optional, List
import uuid
from datetime import datetime

from app.core.base_class import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Table, Column, Uuid
from sqlalchemy.ext.associationproxy import association_proxy, AssociationProxy

author_poem = Table(
    "author_poem",
    Base.metadata,
    Column("poem_id", Uuid, ForeignKey("poem.id", ondelete="CASCADE"), primary_key=True),
    Column("author_id", Uuid, ForeignKey("author.id", ondelete="CASCADE"), primary_key=True),
)

class Author(Base): 
    __tablename__ = "author"
            
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    birth_date: Mapped[Optional[datetime]]
    
    user: Mapped[Optional["User"]] = relationship(back_populates="author") # type: ignore  # noqa: F821
    poems: Mapped[List["Poem"]] = relationship(  # type: ignore  # noqa: F821
        secondary="author_poem",
        back_populates="authors",
        cascade="all, delete"
    )
    
    user_id: AssociationProxy[Optional[uuid.UUID]] = association_proxy("user", "id")
