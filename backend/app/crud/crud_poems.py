from app.models import (
    OriginalPoem, 
    OriginalPoemCreate,
    OriginalPoemUpdate, 
    PoemVersion, 
    PoemVersionCreate,
    PoemVersionUpdate,
    PoemTranslation,
    PoemTranslationCreate,
    PoemTranslationUpdate,
    Author,
)

from sqlmodel import Session, select, or_

import uuid

def create_poem(*, session: Session, poem_in: OriginalPoemCreate) -> OriginalPoem:
    poem = OriginalPoem.model_validate(poem_in)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def create_poem_version(*, session: Session, poem_in: PoemVersionCreate) -> PoemVersion:
    poem = PoemVersion.model_validate(poem_in)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def create_poem_translation(*, session: Session, poem_in: PoemTranslationCreate) -> PoemTranslation:
    poem = PoemTranslation.model_validate(poem_in)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def update_poem(*, session: Session, poem: OriginalPoem, poem_in: OriginalPoemUpdate) -> OriginalPoem:
    poem_data = poem_in.model_dump(exclude_unset=True)
    poem.sqlmodel_update(poem_data)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def update_poem_version(*, session: Session, poem: PoemVersion, poem_in: PoemVersionUpdate) -> PoemVersion:
    poem_data = poem_in.model_dump(exclude_unset=True)
    poem.sqlmodel_update(poem_data)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def update_poem_translation(*, session: Session, poem: PoemTranslation, poem_in: PoemTranslationUpdate) -> PoemTranslation:
    poem_data = poem_in.model_dump(exclude_unset=True)
    poem.sqlmodel_update(poem_data)
    session.add(poem)
    session.commit()
    session.refresh(poem)
    return poem

def get_poem_by_title(*, session: Session, title: str) -> OriginalPoem | PoemTranslation | None:
    statement = select(OriginalPoem, PoemTranslation).join().where(or_(OriginalPoem.title == title, PoemTranslation.title == title))
    poem = session.exec(statement).first()
    return poem

def delete_versions_and_translations(*, session: Session, poem_id: uuid.UUID) -> None:
    statement1 = select(PoemVersion).where(PoemVersion.original_id == poem_id)
    statement2 = select(PoemTranslation).where(PoemTranslation.original_id == poem_id)
    results1 = session.exec(statement1)
    results2 = session.exec(statement2)
    
    for v in results1:
        session.delete(v)
     
    for t in results2:
        session.delete(t)
        
    session.commit()
    
def delete_original_poem(*, session: Session, poem: OriginalPoem) -> None:
    poem_id = poem.id
    delete_versions_and_translations(session=session, poem_id=poem_id)
    session.delete(poem)
    session.commit()
    
def delete_author_poems(*, session: Session, author_id: uuid.UUID) -> None:
    statement1 = select(OriginalPoem).where(Author.id == author_id)
    statement2 = select(PoemTranslation).where(Author.id == author_id)
    results1 = session.exec(statement1)
    results2 = session.exec(statement2)
    
    for p in results1:
        delete_original_poem(session=session, poem=p)
     
    for t in results2:
        session.delete(t)
        
    session.commit()