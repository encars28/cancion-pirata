import uuid
from typing import Any
from venv import logger

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    OriginalPoem, 
    PoemVersion, 
    PoemTranslation,
    OriginalPoemsPublic,
    PoemTranslationsPublic,
    PoemVersionsPublic,
    OriginalPoemPublic,
    PoemVersionPublic,
    PoemTranslationPublic,
    OriginalPoemCreate,
    PoemVersionCreate,
    PoemTranslationCreate,
    AuthorCreate,
    UserUpdate,
    OriginalPoemUpdate,
    PoemTranslationUpdate,
    PoemVersionUpdate,
    Message,
)

from backend.app.crud import user
from backend.app.crud import author, poem

router = APIRouter(prefix="/poems", tags=["poems"])


@router.get("/", response_model=OriginalPoemsPublic)
def read_original_poems(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve original poems.
    """
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(OriginalPoem).where(or_(OriginalPoem.is_public, OriginalPoem.author_id == current_user.author_id))
        count = session.exec(count_statement).one()
        statement = select(OriginalPoem).where(or_(OriginalPoem.is_public, OriginalPoem.author_id == current_user.author_id)).offset(skip).limit(limit)
        poems = session.exec(statement).all()
    else: 
        count_statement = select(func.count()).select_from(OriginalPoem)
        count = session.exec(count_statement).one()
        statement = select(OriginalPoem).offset(skip).limit(limit)
        poems = session.exec(statement).all()

    return OriginalPoemsPublic(data=poems, count=count) # type: ignore


@router.get("/translations", response_model=PoemTranslationsPublic)
def read_translations(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve translations.
    """
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(PoemTranslation).where(or_(PoemTranslation.is_public, PoemTranslation.author_id == current_user.author_id))
        count = session.exec(count_statement).one()
        statement = select(PoemTranslation).where(or_(PoemTranslation.is_public, PoemTranslation.author_id == current_user.author_id)).offset(skip).limit(limit)
        poems = session.exec(statement).all()
    else: 
        count_statement = select(func.count()).select_from(PoemTranslation)
        count = session.exec(count_statement).one()
        statement = select(PoemTranslation).offset(skip).limit(limit)
        poems = session.exec(statement).all()

    return PoemTranslationsPublic(data=poems, count=count) #type: ignore

@router.get("/me", response_model=OriginalPoemsPublic)
def read_poems_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user poems.
    """
    if current_user.author_id is None:
        return OriginalPoemsPublic(data=[], count=0)
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
        count = session.exec(count_statement).one()
        statement = select(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
        poems = session.exec(statement).all()
    else: 
        count_statement = select(func.count()).select_from(OriginalPoem)
        count = session.exec(count_statement).one()
        statement = select(OriginalPoem)
        poems = session.exec(statement).all()
    
    return OriginalPoemsPublic(data=poems, count=count) # type: ignore

@router.get("/translations/me", response_model=PoemTranslationsPublic)
def read_translations_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user translations.
    """
    if current_user.author_id is None:
        return PoemTranslationsPublic(data=[], count=0)
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(PoemTranslation).where(PoemTranslation.author_id == current_user.author_id)
        count = session.exec(count_statement).one()
        statement = select(PoemTranslation).where(PoemTranslation.author_id == current_user.author_id)
        poems = session.exec(statement).all()
    else: 
        count_statement = select(func.count()).select_from(PoemTranslation)
        count = session.exec(count_statement).one()
        statement = select(PoemTranslation)
        poems = session.exec(statement).all()
    
    return PoemTranslationsPublic(data=poems, count=count) # type: ignore

@router.get("/versions/me", response_model=PoemVersionsPublic)
def read_versions_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user versions.
    """
    if current_user.author_id is None:
        return PoemVersionsPublic(data=[], count=0)
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(PoemVersion).join(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
        count = session.exec(count_statement).one()
        statement = select(PoemVersion).join(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
        poems = session.exec(statement).all()
    else: 
        count_statement = select(func.count()).select_from(PoemVersion)
        count = session.exec(count_statement).one()
        statement = select(PoemVersion)
        poems = session.exec(statement).all()
    
    return PoemVersionsPublic(data=poems, count=count) # type: ignore	

@router.get("/{poem_id}", response_model=OriginalPoemPublic)
def read_poem(session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID) -> Any:
    """
    Get poem by ID.
    """
    poem = session.get(OriginalPoem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser and not poem.is_public: 
        if current_user.author_id is None or current_user.author_id != poem.author_id: 
            raise HTTPException(status_code=400, detail="Not enough permissions")

    elif not current_user.is_superuser and poem.is_public: 
        poem.versions = [version for version in poem.versions if version.is_public]
        
    return poem

@router.get("/translations/{poem_id}", response_model=PoemTranslationPublic)
def read_translation(session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID) -> Any:
    """
    Get translation by ID.
    """
    poem = session.get(PoemTranslation, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser and not poem.is_public:
        if current_user.author_id is None or current_user.author_id != poem.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return poem

@router.get("/versions/{poem_id}", response_model=PoemVersionPublic)
def read_version(session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID) -> Any:
    """
    Get version by ID.
    """
    poem = session.get(PoemVersion, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser and not poem.is_public:
        if current_user.author_id is None or current_user.author_id != poem.original.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return poem

@router.post("/", response_model=OriginalPoemPublic)
def create_poem(
    *, session: SessionDep, current_user: CurrentUser, poem_in: OriginalPoemCreate
) -> Any:
    """
    Create new poem.
    """
    
    if poem_in.author_id is None and not current_user.is_superuser:
        if current_user.author_id:
            poem_in.author_id = current_user.author_id
            
        else: 
            if current_user.full_name:
                name = current_user.full_name
        
            else: 
                name = current_user.email
            
            author_in = AuthorCreate(name=name)
            author = author.create_author(session=session, author_in=author_in)

            user_in = UserUpdate(author_id=author.id)
            current_user = user.update_user(session=session, db_user=current_user, user_in=user_in)

            poem_in.author_id = author.id
            
    poem = poem.create_poem(session=session, poem_in=poem_in)
    
    return poem

@router.post("/translations", response_model=PoemTranslationPublic)
def create_translation(
    *, session: SessionDep, current_user: CurrentUser, poem_in: PoemTranslationCreate
) -> Any:
    """
    Create new translation.
    """
    
    if poem_in.author_id is None and not current_user.is_superuser:
        if current_user.author_id:
            poem_in.author_id = current_user.author_id
            
        else: 
            if current_user.full_name:
                name = current_user.full_name
        
            else: 
                name = current_user.email
            
            author_in = AuthorCreate(name=name)
            author = author.create_author(session=session, author_in=author_in)
            
            user_in = UserUpdate(author_id=author.id)
            current_user = user.update_user(session=session, db_user=current_user, user_in=user_in)
            
            poem_in.author_id = author.id
            
    poem = poem.create_poem_translation(session=session, poem_in=poem_in)
    
    return poem

@router.post("/versions", response_model=PoemVersionPublic)
def create_version(
    *, session: SessionDep, current_user: CurrentUser, poem_in: PoemVersionCreate
) -> Any:
    """
    Create new version.
    """
    original = session.get(OriginalPoem, poem_in.original_id)
    if not original:
        raise HTTPException(status_code=404, detail="Original poem not found")
    
    if not current_user.is_superuser:
        if original.author_id is None or original.author_id != current_user.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
            
    poem = poem.create_poem_version(session=session, poem_in=poem_in)
    
    return poem

@router.put("/{poem_id}", response_model=OriginalPoemPublic)
def update_poem(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_id: uuid.UUID,
    poem_in: OriginalPoemUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(OriginalPoem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser:
        if current_user.author_id is None or current_user.author_id != poem.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = poem.update_poem(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.put("/translations/{poem_id}", response_model=PoemTranslationPublic)
def update_translation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_id: uuid.UUID,
    poem_in: PoemTranslationUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(PoemTranslation, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser:
        if current_user.author_id is None or current_user.author_id != poem.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = poem.update_poem_translation(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.put("/versions/{poem_id}", response_model=PoemVersionPublic)
def update_version(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_id: uuid.UUID,
    poem_in: PoemVersionUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(PoemVersion, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser:
        if current_user.author_id is None or current_user.author_id != poem.original.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = poem.update_poem_version(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.delete("/{poem_id}")
def delete_poem(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(OriginalPoem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser: 
        if current_user.author_id is None or poem.author_id != current_user.id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem.delete_original_poem(session=session, poem=poem)
    return Message(message="Poem deleted successfully")

@router.delete("/translations/{poem_id}")
def delete_translation(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(PoemTranslation, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser: 
        if current_user.author_id is None or (poem.author_id != current_user.id):
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(poem)
    session.commit()
    return Message(message="Poem deleted successfully")

@router.delete("/versions/{poem_id}")
def delete_version(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(PoemVersion, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser: 
        if current_user.author_id is None or (poem.original.author_id != current_user.id):
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(poem)
    session.commit()
    return Message(message="Poem deleted successfully")