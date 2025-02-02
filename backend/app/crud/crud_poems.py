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

def delete_author_poems(*, session: Session, author_id: uuid.UUID) -> None:
    statement1 = select(OriginalPoem, PoemVersion).join(OriginalPoem).where(Author.id == author_id)
    statement2 = select(PoemTranslation).join(OriginalPoem).where(Author.id == author_id)
    results1 = session.exec(statement1)
    results2 = session.exec(statement2)
    
    for p, v in results1:
        session.delete(v)
        session.delete(p)
     
    for t in results2:
        session.delete(t)
        
    session.commit()