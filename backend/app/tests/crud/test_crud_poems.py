from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from app.crud import crud_poems
from app.models import (
    OriginalPoem, 
    PoemVersion,
    PoemTranslation,
    OriginalPoemCreate,
    PoemVersionCreate,
    PoemTranslationCreate,
    OriginalPoemUpdate, 
    PoemVersionUpdate,
    PoemTranslationUpdate,
)

from app.tests.utils.utils import random_lower_string
from app.tests.utils.poem import create_random_original_poem, create_random_version_poem, create_random_translation_poem, create_random_author

def test_create_poem(db: Session) -> None:
    title = random_lower_string()
    content = random_lower_string()
    
    poem_in = OriginalPoemCreate(title=title, content=content)
    poem = crud_poems.create_poem(session=db, poem_in=poem_in)
    assert poem.title == title
    assert poem.content == content
    
def test_create_poem_version(db: Session) -> None:
    original = create_random_original_poem(db)
    
    title = random_lower_string()
    content = random_lower_string()
    
    poem_in = PoemVersionCreate(title=title, content=content, original_id=original.id)
    poem = crud_poems.create_poem_version(session=db, poem_in=poem_in)
    assert poem.title == title
    assert poem.content == content
    assert poem.original_id == original.id
    
def test_create_poem_translation(db: Session) -> None:
    original = create_random_original_poem(db)
    
    title = random_lower_string()
    content = random_lower_string()
    
    poem_in = PoemTranslationCreate(title=title, content=content, original_id=original.id)
    poem = crud_poems.create_poem_translation(session=db, poem_in=poem_in)
    assert poem.title == title
    assert poem.content == content
    assert poem.original_id == original.id

def test_get_original_poem(db: Session) -> None:
    poem = create_random_original_poem(db)
    
    poem_2 = db.get(OriginalPoem, poem.id)
    assert poem_2
    assert poem.title == poem_2.title
    assert poem.content == poem_2.content
    assert jsonable_encoder(poem) == jsonable_encoder(poem_2)

def test_get_poem_version(db: Session) -> None:
    original = create_random_original_poem(db)
    poem = create_random_version_poem(db, original)
    
    poem_2 = db.get(PoemVersion, poem.id)
    assert poem_2
    assert poem.title == poem_2.title
    assert poem.content == poem_2.content
    assert poem.original_id == poem_2.original_id
    assert jsonable_encoder(poem) == jsonable_encoder(poem_2)
    
def test_get_poem_translation(db: Session) -> None:
    original = create_random_original_poem(db)
    poem = create_random_translation_poem(db, original)
    
    poem_2 = db.get(PoemTranslation, poem.id)
    assert poem_2
    assert poem.title == poem_2.title
    assert poem.content == poem_2.content
    assert poem.original_id == poem_2.original_id
    assert jsonable_encoder(poem) == jsonable_encoder(poem_2)

def test_update_original_poem(db: Session) -> None:
    poem = create_random_original_poem(db)

    new_content = random_lower_string()
    poem_in_update = OriginalPoemUpdate(content=new_content)
    
    if poem.id is not None:
        crud_poems.update_poem(session=db, poem=poem, poem_in=poem_in_update)
        
    poem_2 = db.get(OriginalPoem, poem.id)
    assert poem_2
    assert poem.content == poem_2.content
    
def test_update_poem_version(db: Session) -> None:
    original = create_random_original_poem(db)
    poem = create_random_version_poem(db, original)
    
    new_content = random_lower_string()
    poem_in_update = PoemVersionUpdate(content=new_content)
    
    if poem.id is not None:
        crud_poems.update_poem_version(session=db, poem=poem, poem_in=poem_in_update)
        
    poem_2 = db.get(PoemVersion, poem.id)
    assert poem_2
    assert poem.content == poem_2.content
    
def test_update_poem_translation(db: Session) -> None:
    original = create_random_original_poem(db)
    poem = create_random_translation_poem(db, original)
    
    new_content = random_lower_string()
    poem_in_update = PoemTranslationUpdate(content=new_content)
    
    if poem.id is not None:
        crud_poems.update_poem_translation(session=db, poem=poem, poem_in=poem_in_update)
        
    poem_2 = db.get(PoemTranslation, poem.id)
    assert poem_2
    assert poem.content == poem_2.content
    
def test_delete_author_poems(db: Session) -> None: 
    author = create_random_author(db)
    poem_1 = create_random_original_poem(db, author)
    poem_2 = create_random_version_poem(db, poem_1)
    poem_3 = create_random_translation_poem(db, poem_1)
    
    crud_poems.delete_author_poems(session=db, author_id=author.id)
    
    assert author
    assert db.get(OriginalPoem, poem_1.id) is None
    assert db.get(PoemVersion, poem_2.id) is None
    assert db.get(PoemTranslation, poem_3.id) is None
    