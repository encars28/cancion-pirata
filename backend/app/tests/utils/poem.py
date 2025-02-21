from typing import List
import uuid
from sqlalchemy.orm import Session
from app.crud.poem import poem_crud
from app.crud.poem_poem import poem_poem_crud

from app.tests.utils.utils import random_lower_string
from app.schemas.poem import PoemCreate, PoemSchema
from app.schemas.poem_poem import PoemType, PoemPoemCreate


def create_random_poem(
    db: Session,
    author_ids: List[uuid.UUID] = [],
    is_public: bool = True,
    show_author: bool = True,
) -> PoemSchema:
    title = random_lower_string()
    content = random_lower_string()
    poem_in = PoemCreate(
        title=title,
        is_public=is_public,
        content=content,
        show_author=show_author,
        author_ids=author_ids,
    )
    poem = poem_crud.create(db=db, obj_create=poem_in)

    return poem  # type: ignore


def create_random_derived_poem(
    db: Session,
    original_id: uuid.UUID,
    author_ids: List[uuid.UUID] = [],
    is_public: bool = True,
    show_author: bool = True,
    type: int = PoemType.TRANSLATION.value,
) -> PoemSchema:
    poem = create_random_poem(
        db=db, author_ids=author_ids, is_public=is_public, show_author=show_author
    )
    poem_poem_in = PoemPoemCreate(
        original_poem_id=original_id, derived_poem_id=poem.id, type=type
    )
    poem_poem_crud.create(db=db, obj_create=poem_poem_in)

    return poem
