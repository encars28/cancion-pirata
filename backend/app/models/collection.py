from typing import Optional, List
import uuid
from datetime import datetime
from sqlalchemy import func, DateTime, String, Table, Column, ForeignKey, Uuid

from app.core.base_class import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy, AssociationProxy


collection_poem = Table(
    "collection_poem",
    Base.metadata,
    Column(
        "poem_id", Uuid, ForeignKey("poem.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "collection_id",
        Uuid,
        ForeignKey("colection.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Collection(Base):
    __tablename__ = "collection"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]]
    is_public: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        back_populates="collections"
    )
    
    poems: Mapped[List["Poem"]] = relationship(  # type: ignore  # noqa: F821
        secondary="collection_poem",
        back_populates="collections",
    )
    
    # proxies
    poem_ids: AssociationProxy[List[uuid.UUID]] = association_proxy("poems", "id")
