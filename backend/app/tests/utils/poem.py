from typing import Optional, List
import uuid
from sqlalchemy.orm import Session
from app.crud.poem import poem_crud, poem_poem_crud

from app.tests.utils.utils import random_lower_string

from app.models.poem import Poem
from app.models.author import Author
from app.schemas.poem import PoemCreate, PoemPoemCreate, PoemType

def create_random_poem(
    db: Session, 
    authors: List[Author] = [], 
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
    
    title = random_lower_string()
    content = random_lower_string()
    poem_in = PoemCreate(title=title, is_public=is_public, content=content, show_author=show_author)
    poem = poem_crud.create(db=db, obj_create=poem_in)
    
    if authors != []: 
        poem = poem_crud.update_authors(db=db, db_obj=poem, authors=authors)
    
    return poem

def create_random_version(
    db: Session, 
    original_id: uuid.UUID, 
    authors: List[Author] = [], 
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
    
    poem = create_random_poem(db=db, authors=authors, is_public=is_public, show_author=show_author)
    poem_poem_in = PoemPoemCreate(original_poem_id=original_id, derived_poem_id=poem.id, type=PoemType.VERSION.value)
    poem_poem_crud.create(db=db, obj_create=poem_poem_in)
    
    return poem

def create_random_translation(
    db: Session, 
    original_id: uuid.UUID,
    authors: List[Author] = [], 
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
        
    poem = create_random_poem(db=db, authors=authors, is_public=is_public, show_author=show_author)
    poem_poem_in = PoemPoemCreate(original_poem_id=original_id, derived_poem_id=poem.id, type=PoemType.TRANSLATION.value)
    poem_poem_crud.create(db=db, obj_create=poem_poem_in)
    
    return poem