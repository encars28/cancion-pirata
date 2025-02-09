from typing import Optional, List
import uuid
from datetime import datetime

from app.core.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

class Poem_Poem(Base):
    __tablename__ = "poem_poem"
    
    poem_id1: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    poem_id2: Mapped[uuid.UUID] = mapped_column(ForeignKey("poem.id"), primary_key=True)
    
    type: Mapped[int]
    # 0: translation
    # 1: version
    
class Poem(Base): 
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    content: Mapped[str]
    is_public: Mapped[bool]
    publication_date: Mapped[Optional[datetime]]
    language: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now(), onupdate=datetime.now())
    
    author: Mapped[List["Author"]] = relationship(secondary="author_poem", back_populates="poems") # type: ignore 
    original: Mapped[Optional["Poem"]] = relationship(secondary=Poem_Poem, back_populates="derived_poems", uselist=False)
    derived_poems: Mapped[List["Poem"]] = relationship(secondary=Poem_Poem, back_populates="original")
    
    def __repr__(self) -> str:
        return f"Poem(id={self.id!r}, title={self.title!r}, content={self.content!r}, is_public={self.is_public!r}, publication_date={self.publication_date!r}, language={self.language!r}, author={self.author!r}, original={self.original!r}, derived_poems={self.derived_poems!r})"