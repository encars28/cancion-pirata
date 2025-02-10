from __future__ import annotations
from typing import Optional, List
import uuid
from datetime import datetime

from app.core.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from sqlalchemy.ext.associationproxy import association_proxy, AssociationProxy

class Poem_Poem(Base):
    __tablename__ = "poem_poem"
    
    original_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    original: Mapped[Poem] = relationship(back_populates="derived_poems")
    
    derived_poem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    derived_poem: Mapped[Poem] = relationship(back_populates="original")
    
    type: Mapped[int]
    # 0: translation
    # 1: version
    
class Poem(Base): 
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    content: Mapped[str]
    is_public: Mapped[bool]
    show_author: Mapped[bool]
    
    language: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    
    author: Mapped[List["Author"]] = relationship(secondary="author_poem", back_populates="poems") # type: ignore 
    original: Mapped[Optional[Poem_Poem]] = relationship(back_populates="derived_poem", uselist=False)
    derived_poems: Mapped[List[Poem_Poem]] = relationship(back_populates="original")
    
    # proxies
    author_id: AssociationProxy[List[uuid.UUID]] = association_proxy("author", "id")
    
    def __repr__(self) -> str:
        return f"Poem(id={self.id!r}, title={self.title!r}, is_public={self.is_public!r})"