import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep

from app.models.poem import Poem, Poem_Poem
from app.models.author import Author
from app.schemas.poem import (
    PoemCreate, 
    PoemPoemCreate, 
    PoemUpdate, 
    PoemPublicWithAllTheInfo, 
    PoemsPublic, 
    PoemPoemCreate,
    PoemPoemUpdate
)
from app.schemas.author import AuthorCreate
from app.schemas.user import UserUpdate
from app.schemas.common import Message

from app.crud.user import user_crud
from app.crud.author import author_crud
from app.crud.poem import poem_crud, poem_poem_crud

router = APIRouter(prefix="/poems", tags=["poems"])


@router.get("/", response_model=PoemsPublic)
def read_poems(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve poems.
    """
    # Retrieve public poems
    if not current_user.is_superuser:
        count = poem_crud.get_count(session, Poem.is_public == True)
        public_poems = poem_crud.get_many(session, Poem.is_public == True, skip=skip, limit=limit)
        for poem in public_poems: 
            if not poem.show_author and current_user.author_id not in poem.author_ids: 
                poem.author = []

    else:  
        # retrieve all poems
        count = poem_crud.get_count(session)
        poems = poem_crud.get_many(session, skip=skip, limit=limit)

    return PoemsPublic(data=poems, count=count) # type: ignore

@router.get("/me", response_model=PoemsPublic)
def read_poems_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user poems.
    """
    if current_user.author_id is None or current_user.author is None:
        poems = []
        count = 0
    else: 
        if not current_user.is_superuser:
            poems = current_user.author.poems
            count = len(poems)

        else: 
            count = poem_crud.get_count(session)
            poems = poem_crud.get_many(session, skip=0, limit=100)
    
    return PoemsPublic(data=poems, count=count) # type: ignore

@router.get("/{poem_id}", response_model=PoemPublicWithAllTheInfo)
def read_poem(session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID) -> Any:
    """
    Get poem by ID.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser and not poem.is_public: 
        if current_user.author_id is None or current_user.author_id != poem.author_ids: 
            raise HTTPException(status_code=400, detail="Not enough permissions")

    elif not current_user.is_superuser and poem.is_public: 
        poem.derived_poems = [poem for poem in poem.derived_poems if poem.is_public]
        
        if not poem.show_author: 
            poem.authors = []
        
    return poem

@router.post("/", response_model=PoemPublicWithAllTheInfo)
def create_poem(
    *, session: SessionDep, 
    current_user: CurrentUser, 
    poem_in: PoemCreate, 
) -> Any:
    """
    Create new poem.
    """
    
    if not poem_in.author_ids and not current_user.is_superuser:
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
    
    if poem_in.author_ids:
        authors = author_crud.get_many(session, Author.id.in_(poem_in.author_ids))
        if None in authors:
            raise HTTPException(status_code=404, detail="Author not found")

        poem = poem_crud.update_authors(db=session, db_obj=poem, authors=authors)
        
    if poem_in.type is not None and poem_in.original_poem_id:
        poem_poem_in = PoemPoemCreate(
            type=poem_in.type, 
            original_poem_id=poem_in.original_poem_id, 
            derived_poem_id=poem.id
        )
        poem_poem = poem_poem_crud.create(db=session, obj_create=poem_poem_in)
    
    return poem

@router.put("/{poem_id}", response_model=PoemPublicWithAllTheInfo)
def update_poem(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_id: uuid.UUID,
    poem_in: PoemUpdate,
) -> Any:
    """
    Update a poem.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser:
        if current_user.author_id is None or current_user.author_id not in poem.author_ids:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    if poem_in.author_ids:
        authors = author_crud.get_many(session, Author.id.in_(poem_in.author_ids))
        if None in authors:
            raise HTTPException(status_code=404, detail="Author not found")
            
        poem = poem_crud.update_authors(db=session, db_obj=poem, authors=authors)
        
        poem_in_data = poem_in.model_dump(exclude_unset=True)
        del poem_in_data["author_ids"]
        poem_in = PoemUpdate(**poem_in_data)
        
    poem = poem_crud.update(db=session, db_obj=poem, obj_update=poem_in)
            
    if current_user.is_superuser and poem_in.type is not None and poem_in.original_poem_id:
        poem_poem = poem_poem_crud.get_one(session, Poem_Poem.derived_poem_id == poem_id)
        
        if not poem_poem:
            poem_poem_in = PoemPoemCreate(
                type=poem_in.type, 
                original_poem_id=poem_in.original_poem_id, 
                derived_poem_id=poem.id
            )
            poem_poem = poem_poem_crud.create(db=session, obj_create=poem_poem_in)
            
        else:
            poem_poem_in = PoemPoemUpdate(
                type=poem_in.type, 
                original_poem_id=poem_in.original_poem_id, 
            )

            poem_poem_crud.update(db=session, db_obj=poem_poem, obj_update=poem_poem_in)
    
    return poem

@router.delete("/{poem_id}")
def delete_poem(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete a poem.
    """
    poem = session.get(Poem, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    if not current_user.is_superuser: 
        if current_user.author_id is None or current_user.author_id not in poem.author_ids:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    poem_crud.delete(db=session, db_obj=poem)
    return Message(message="Poem deleted successfully")