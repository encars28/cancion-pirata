from app.models import (
    OriginalPoem, 
    OriginalPoemCreate, 
    Author, 
    AuthorCreate, 
    PoemVersion, 
    PoemTranslation, 
    PoemVersionCreate, 
    PoemTranslationCreate,
)
from sqlmodel import Session
from app.crud import crud_poems, crud_author

from app.tests.utils.utils import random_lower_string

def create_random_original_poem(db: Session, author: Author | None = None, is_public: bool = True) -> OriginalPoem:
    title = random_lower_string()
    content = random_lower_string()
    
    if author: 
        poem_in = OriginalPoemCreate(title=title, content=content, is_public=is_public, author_id=author.id)
    else: 
        poem_in = OriginalPoemCreate(title=title, is_public=is_public, content=content)
        
    poem = crud_poems.create_poem(session=db, poem_in=poem_in)
    return poem


def create_random_author(db: Session) -> Author:
    name = random_lower_string()
    author_in = AuthorCreate(name=name)
    author = crud_author.create_author(session=db, author_in=author_in)
    return author

def create_random_version_poem(db: Session, original: OriginalPoem, is_public: bool = True) -> PoemVersion:
    title = random_lower_string()
    content = random_lower_string()
    
    poem_in = PoemVersionCreate(title=title, content=content, is_public=is_public, original_id=original.id)
    poem = crud_poems.create_poem_version(session=db, poem_in=poem_in)
    return poem

def create_random_translation_poem(db: Session, original: OriginalPoem, author: Author | None = None, is_public: bool = True) -> PoemTranslation:
    title = random_lower_string()
    content = random_lower_string()
    
    if author: 
        poem_in = PoemTranslationCreate(title=title, content=content, is_public=is_public, original_id=original.id, author_id=author.id)
    else: 
        poem_in = PoemTranslationCreate(title=title, content=content, is_public=is_public, original_id=original.id)
        
    poem = crud_poems.create_poem_translation(session=db, poem_in=poem_in)
    return poem