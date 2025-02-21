from typing import Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class PoemType(Enum):
    TRANSLATION = 0
    VERSION = 1


class PoemPoemBase(BaseModel):
    type: int


class PoemPoemCreate(PoemPoemBase):
    original_poem_id: uuid.UUID
    derived_poem_id: uuid.UUID


class PoemPoemUpdate(PoemPoemBase):
    original_poem_id: Optional[uuid.UUID] = None  # type: ignore
    derived_poem_id: Optional[uuid.UUID] = None  # type: ignore
    type: Optional[int] = None  # type: ignore


class PoemPoemSchema(PoemPoemBase):
    model_config = ConfigDict(from_attributes=True)
    original_poem_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    derived_poem_id: uuid.UUID
