from typing import Optional
import uuid
from datetime import date, datetime

from pydantic import EmailStr
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, UniqueConstraint

from app.core.db import Base

class User(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    email: Mapped[EmailStr] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str]
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool]
    is_superuser: Mapped[bool]
    created_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("author.id"))
    author: Mapped[Optional["Author"]] = relationship(back_populates="user") # type: ignore
    
    __table_args__ = (UniqueConstraint("author_id"),)
    
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, fullname={self.fullname!r}, is_active={self.is_active!r}, is_superuser={self.is_superuser!r}, author_id={self.author_id!r})"