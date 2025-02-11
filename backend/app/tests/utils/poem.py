from typing import Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.poem import poem_crud, poem_poem_crud

from app.tests.utils.utils import random_lower_string

from app.models.poem import Poem, Poem_Poem
from app.models.author import Author
from app.schemas.poem import PoemCreate, PoemPoemCreate, PoemType

def create_random_poem(
    db: Session, 
    author: Optional[Author] = None, 
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
    
    title = random_lower_string()
    content = random_lower_string()
    poem_in = PoemCreate(title=title, is_public=is_public, content=content, show_author=show_author)
    poem = poem_crud.create_poem(session=db, poem_in=poem_in)
    
    if author: 
        poem = poem_crud.update_author(db=db, db_obj=poem, author=author)
    
    return poem

def create_random_version(
    db: Session, 
    original_id: uuid.UUID, 
    author: Optional[Author] = None,
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
    
    poem = create_random_poem(db=db, author=author, is_public=is_public, show_author=show_author)
    poem_poem_in = PoemPoemCreate(original_id=original_id, derived_poem_id=poem.id, type=PoemType.VERSION.value)
    poem_poem_crud.create(db=db, obj_in=poem_poem_in)
    
    return poem

def create_random_translation(
    db: Session, 
    original_id: uuid.UUID,
    author: Optional[Author] = None,
    is_public: bool = True,
    show_author: bool = True
) -> Poem:
        
    poem = create_random_poem(db=db, author=author, is_public=is_public, show_author=show_author)
    poem_poem_in = PoemPoemCreate(original_id=original_id, derived_poem_id=poem.id, type=PoemType.TRANSLATION.value)
    poem_poem_crud.create(db=db, obj_in=poem_poem_in)
    
    return poem