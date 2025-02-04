import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    OriginalPoem, 
    PoemVersion, 
    PoemTranslation,
    OriginalPoemsPublic,
    PoemTranslationsPublic,
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

from app.crud import crud_poems, crud_author, crud_user

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
        count = session.exec(OriginalPoem).one()
        statement = select(PoemTranslation).offset(skip).limit(limit)
        poems = session.exec(statement).all()

    return OriginalPoemsPublic(data=poems, count=count)


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

    return PoemTranslationsPublic(data=poems, count=count)

@router.get("/{id}", response_model=OriginalPoemPublic)
def read_poem(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get poem by ID.
    """
    poem = session.get(OriginalPoem, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser or current_user.author_id != poem.author_id:
        if not poem.is_public:
            raise HTTPException(status_code=400, detail="Not enough permissions")
        
        poem.versions = [version for version in poem.versions if version.is_public]
        
    return poem

@router.get("/translations/{id}", response_model=PoemTranslationPublic)
def read_translation(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get translation by ID.
    """
    poem = session.get(PoemTranslation, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not poem.is_public and current_user.author_id != poem.author_id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return poem

@router.get("/versions/{id}", response_model=PoemVersionPublic)
def read_version(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get translation by ID.
    """
    poem = session.get(PoemVersion, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not poem.is_public and current_user.author_id != poem.original.author_id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return poem

@router.get("/me", response_model=OriginalPoemsPublic)
def read_poems_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user poems.
    """
    if not current_user.author_id:
        return OriginalPoemsPublic(data=[], count=0)
    
    count_statement = select(func.count()).select_from(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
    count = session.exec(count_statement).one()
    statement = select(OriginalPoem).where(OriginalPoem.author_id == current_user.author_id)
    poems = session.exec(statement).all()
    
    return OriginalPoemsPublic(data=poems, count=count)

@router.get("/translations/me", response_model=PoemTranslationsPublic)
def read_translations_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user translations.
    """
    if not current_user.author_id:
        return PoemTranslationsPublic(data=[], count=0)
    
    count_statement = select(func.count()).select_from(PoemTranslation).where(PoemTranslation.author_id == current_user.author_id)
    count = session.exec(count_statement).one()
    statement = select(PoemTranslation).where(PoemTranslation.author_id == current_user.author_id)
    poems = session.exec(statement).all()
    
    return PoemTranslationsPublic(data=poems, count=count)

@router.get("/versions/me", response_model=PoemVersionPublic)
def read_versions_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user versions.
    """
    if not current_user.author_id:
        return PoemVersionPublic(data=[], count=0)
    
    count_statement = select(func.count()).select_from(PoemVersion).where(PoemVersion.author_id == current_user.author_id)
    count = session.exec(count_statement).one()
    statement = select(PoemVersion).where(PoemVersion.author_id == current_user.author_id)
    poems = session.exec(statement).all()
    
    return PoemVersionPublic(data=poems, count=count)

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
            author = crud_author.create_author(session, author_in)

            user_in = UserUpdate(author_id=author.id)
            current_user = crud_user.update_user(session, current_user, user_in)

            poem_in.author_id = author.id
            
    poem = crud_poems.create_poem(session=session, poem_in=poem_in)
    
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
            author = crud_author.create_author(session, author_in)
            
            user_in = UserUpdate(author_id=author.id)
            current_user = crud_user.update_user(session, current_user, user_in)
            
            poem_in.author_id = author.id
            
    poem = crud_poems.create_poem_translation(session=session, poem_in=poem_in)
    
    return poem

@router.post("/versions", response_model=PoemVersionPublic)
def create_version(
    *, session: SessionDep, current_user: CurrentUser, poem_in: PoemVersionCreate
) -> Any:
    """
    Create new version.
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
            author = crud_author.create_author(session, author_in)
            
            user_in = UserUpdate(author_id=author.id)
            current_user = crud_user.update_user(session, current_user, user_in)
            
            poem_in.author_id = author.id
            
    poem = crud_poems.create_poem_version(session=session, poem_in=poem_in)
    
    return poem

@router.put("/{id}", response_model=OriginalPoemPublic)
def update_poem(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    poem_in: OriginalPoemUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(OriginalPoem, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.author_id != current_user.author_id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = crud_poems.update_poem(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.put("/translations/{id}", response_model=PoemTranslationPublic)
def update_translation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    poem_in: PoemTranslationUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(PoemTranslation, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.author_id != current_user.author_id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = crud_poems.update_poem_translation(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.put("/versions/{id}", response_model=PoemVersionPublic)
def update_version(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    poem_in: PoemVersionUpdate,
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(PoemVersion, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.author_id != current_user.author_id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = crud_poems.update_poem_version(session=session, poem=poem, poem_in=poem_in)
    
    return poem

@router.delete("/{id}")
def delete_poem(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(OriginalPoem, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    crud_poems.delete_original_poem(session=session, poem=poem)
    return Message(message="Poem deleted successfully")

@router.delete("/translations/{id}")
def delete_translation(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(PoemTranslation, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(poem)
    session.commit()
    return Message(message="Poem deleted successfully")

@router.delete("/versions/{id}")
def delete_version(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(PoemVersion, id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    if not current_user.is_superuser and (poem.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(poem)
    session.commit()
    return Message(message="Poem deleted successfully")