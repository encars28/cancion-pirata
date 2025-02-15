from typing import Optional, List
import uuid
from datetime import datetime

from app.core.base_class import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from sqlalchemy.ext.associationproxy import association_proxy, AssociationProxy
    
class Poem(Base): 
    __tablename__ = "poem"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), index=True, unique=True)
    content: Mapped[str]
    is_public: Mapped[bool] = mapped_column(default=True)
    show_author: Mapped[bool] = mapped_column(default=True)
    
    language: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    
    authors: Mapped[List["Author"]] = relationship(secondary="author_poem", back_populates="poems") # type: ignore 
    
    original: Mapped[Optional["Poem_Poem"]] = relationship(
        back_populates="derived_poem", 
        foreign_keys="Poem_Poem.original_poem_id",
    )
    derived_poems: Mapped[List["Poem_Poem"]] = relationship(
        back_populates="original_poem", 
        foreign_keys="Poem_Poem.derived_poem_id",
    )
    
    # proxies
    author_ids: AssociationProxy[List[uuid.UUID]] = association_proxy("authors", "id")
    author_names: AssociationProxy[List[str]] = association_proxy("authors", "full_name")
    
    def __repr__(self) -> str:
        return f"Poem(id={self.id!r}, title={self.title!r}, is_public={self.is_public!r})"
    
class Poem_Poem(Base):
    __tablename__ = "poem_poem"
    
    original_poem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    original_poem: Mapped[Poem] = relationship(
        back_populates="derived_poems", 
        foreign_keys=[original_poem_id],
        overlaps="original"
    )
    
    derived_poem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    derived_poem: Mapped[Poem] = relationship(
        back_populates="original", 
        foreign_keys=[derived_poem_id],
        overlaps="derived_poems"
    )
    
    type: Mapped[int]