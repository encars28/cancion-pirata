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
    
    authors: Mapped[List["Author"]] = relationship( # type: ignore
        secondary="author_poem", 
        back_populates="poems",
        passive_deletes=True
    )

    original_reference: Mapped[Optional["Poem_Poem"]] = relationship(
        back_populates="derived_poem",
        primaryjoin="Poem.id == foreign(Poem_Poem.derived_poem_id)",
        viewonly=True
    )
    derived_poems_references: Mapped[List["Poem_Poem"]] = relationship(
        back_populates="original_poem",
        primaryjoin="Poem.id == Poem_Poem.original_poem_id",
        cascade="all",
        viewonly=True
    )
    
    # proxies
    author_ids: AssociationProxy[List[uuid.UUID]] = association_proxy("authors", "id")
    author_names: AssociationProxy[List[str]] = association_proxy("authors", "full_name")
    
    original: AssociationProxy[Optional["Poem"]] = association_proxy("original_reference", "original_poem")
    derived_poems: AssociationProxy[List["Poem"]] = association_proxy("derived_poems_references", "derived_poem", creator=lambda x: Poem_Poem(derived_poem=x))
    type: AssociationProxy[Optional[int]] = association_proxy("original_reference", "type", creator=lambda x: Poem_Poem(type=x))
    
class Poem_Poem(Base):
    __tablename__ = "poem_poem"
    
    original_poem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id", ondelete="CASCADE"), primary_key=True)
    derived_poem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id", ondelete="CASCADE"), primary_key=True)
    type: Mapped[int]
    
    original_poem: Mapped[Poem] = relationship(
        back_populates="derived_poems_references",
        primaryjoin="Poem_Poem.original_poem_id == Poem.id",
        passive_deletes=True,
    )
    derived_poem: Mapped[Poem] = relationship(
        back_populates="original_reference",
        primaryjoin="Poem_Poem.derived_poem_id == Poem.id",
    )
    