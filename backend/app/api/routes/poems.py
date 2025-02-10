import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select, or_

from app.api.deps import CurrentUser, SessionDep

from app.models.poem import Poem, Poem_Poem
from app.models.author import Author
from app.schemas.poem import PoemCreate, PoemUpdate, PoemPublic, PoemsPublic
from app.schemas.author import AuthorCreate
from app.schemas.user import UserUpdate
from app.schemas.common import Message

from app.crud.user import user_crud
from app.crud.author import author_crud
from app.crud.poem import poem_crud, poem_poem_crud

router = APIRouter(prefix="/poems", tags=["poems"])

#TODO
@router.get("/", response_model=PoemsPublic)
def read_poems(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve original poems.
    """
    
    if not current_user.is_superuser and current_user.author_id is None:
        count_statement = select(func.count()).select_from(Poem).where((Poem.is_public == True))
        count = session.execute(count_statement).scalar()
        poems = poem_crud.get_many(session, Poem.is_public == True, Poem.author.id == current_user.author_id, skip=skip, limit=limit)
        
    elif not current_user.is_superuser and current_user.author_id:
        count_statement = select(func.count()).select_from(Poem).where(or_(Poem.is_public == True, current_user.author_id in Poem.author_id)) # type: ignore
        count = session.execute(count_statement).scalar()
        poems = poem_crud.get_many(session, or_(Poem.is_public == True, current_user.author_id in Poem.author_id), skip=skip, limit=limit) # type: ignore
        
    else:  
        count_statement = select(func.count()).select_from(Poem)
        count = session.execute(count_statement).scalar()
        poems = poem_crud.get_many(session, skip=skip, limit=limit)

    return OriginalPoemsPublic(data=poems, count=count) # type: ignore

#TODO
@router.get("/me", response_model=PoemsPublic)
def read_poems_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user poems.
    """
    if current_user.author_id is None:
        return PoemsPublic(data=[], count=0)
    
    if not current_user.is_superuser:
        count_statement = select(func.count()).select_from(Poem).where(current_user.author_id in Poem.author_id) # type: ignore
        count = session.execute(count_statement).scalar()
        poems = poem_crud.get_many(session, current_user.author_id in Poem.author_id) # type: ignore
        
    else: 
        count_statement = select(func.count()).select_from(Poem)
        count = session.execute(count_statement).one()
        poems = poem_crud.get_many(session, skip=0, limit=100)
    
    return OriginalPoemsPublic(data=poems, count=count) # type: ignore

@router.get("/{poem_id}", response_model=PoemPublic)
def read_poem(session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID) -> Any:
    """
    Get poem by ID.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser and not poem.is_public: 
        if current_user.author_id is None or current_user.author_id != poem.author_id: 
            raise HTTPException(status_code=400, detail="Not enough permissions")

    elif not current_user.is_superuser and poem.is_public: 
        poem.derived_poems = [poem for poem in poem.derived_poems if poem.is_public]
        
        if not poem.show_author: 
            poem.author = []
        
    return poem

@router.post("/", response_model=PoemPublic)
def create_poem(
    *, session: SessionDep, current_user: CurrentUser, poem_in: PoemCreate, author: Author | None = None
) -> Any:
    """
    Create new poem.
    """
    
    if not author and not current_user.is_superuser:
        if current_user.author_id:
            author = session.get(Author, current_user.author_id)
            
        else: 
            if current_user.full_name:
                name = current_user.full_name
            else: 
                name = current_user.email
            
            author_in = AuthorCreate(full_name=name)
            author = author_crud.create(db=session, obj_create=author_in)

            user_in = UserUpdate(author_id=author.id) # type: ignore
            current_user = user_crud.update(db=session, db_obj=current_user, obj_update=user_in)
            
    poem = poem_crud.create(db=session, obj_create=poem_in)
    if author: 
        poem = poem_crud.update_author(db=session, db_obj=poem, author=author)
    
    return poem

@router.put("/{poem_id}", response_model=PoemPublic)
def update_poem(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_id: uuid.UUID,
    poem_in: PoemUpdate,
    author: Author | None = None
) -> Any:
    """
    Update an poem.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser:
        if current_user.author_id is None or current_user.author_id not in poem.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem = poem.update_poem(session=session, poem=poem, poem_in=poem_in)
    if author:
        poem = poem_crud.update_author(db=session, db_obj=poem, author=author)
    
    return poem

@router.delete("/{poem_id}")
def delete_poem(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete an poem.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser: 
        if current_user.author_id is None or current_user.author_id not in poem.author_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem_crud.delete(db=session, db_obj=poem)
    return Message(message="Poem deleted successfully")