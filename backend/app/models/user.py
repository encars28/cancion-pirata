from typing import Optional
import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String

from app.core.base_class import Base

class User(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[EmailStr] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str]
    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)
    
    full_name: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    created_at: Mapped[Optional[datetime]] = mapped_column(default=datetime.now())
    
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("author.id"), default=None, unique=True)
    author: Mapped[Optional["Author"]] = relationship(back_populates="user") # type: ignore
    