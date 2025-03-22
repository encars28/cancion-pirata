import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, OptionalCurrentUser, SessionDep

from app.schemas.poem import (
    PoemCreate,
    PoemUpdate,
    PoemPublicWithAllTheInfo,
    PoemsPublic,
)
from app.schemas.poem_poem import PoemPoemCreate, PoemPoemUpdate
from app.schemas.author import AuthorCreate
from app.schemas.user import UserUpdate
from app.schemas.common import Message

from app.crud.user import user_crud
from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.poem_poem import poem_poem_crud

router = APIRouter(prefix="/poems", tags=["poems"])


@router.get("/", response_model=PoemsPublic)
def read_poems(
    session: SessionDep, current_user: OptionalCurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all poems.
    """
    # Retrieve public poems
    if current_user and not current_user.is_superuser:
        count = poem_crud.get_public_count(session)
        poems = poem_crud.get_all_public(session, skip=skip, limit=limit)

        for poem in poems:
            if not poem.show_author and current_user.author_id not in poem.author_ids:
                poem.author_names = []
        
        if current_user.author_id:
            author = author_crud.get_by_id(session, current_user.author_id)
            author_poems = [poem for poem in author.poems if not poem.is_public] # type: ignore
            poems += author_poems
            count += len(author_poems)

    else:
        # retrieve all poems
        count = poem_crud.get_count(session)
        poems = poem_crud.get_all(session, skip=skip, limit=limit)

    poems = [PoemPublicWithAllTheInfo.model_validate(poem) for poem in poems]
    return PoemsPublic(data=poems, count=count)


@router.get("/me", response_model=PoemsPublic)
def read_poems_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user poems.
    """
    author = author_crud.get_by_id(session, current_user.author_id)
    if not current_user.is_superuser and not author:
        poems = []
        count = 0

    elif current_user.is_superuser:
        count = poem_crud.get_count(session)
        poems = poem_crud.get_all(session, skip=0, limit=100)

    else: 
        poems = author.poems # type: ignore
        count = len(poems)

    poems = [PoemPublicWithAllTheInfo.model_validate(poem) for poem in poems]
    return PoemsPublic(data=poems, count=count)


@router.get("/{poem_id}", response_model=PoemPublicWithAllTheInfo)
def read_poem(
    session: SessionDep, current_user: OptionalCurrentUser, poem_id: uuid.UUID
) -> Any:
    """
    Get poem by ID.
    """
    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if current_user and not current_user.is_superuser and not poem.is_public:
        if current_user.author_id is None or current_user.author_id != poem.author_ids:
            raise HTTPException(status_code=400, detail="Not enough permissions")

    elif current_user and not current_user.is_superuser and poem.is_public:
        poem.derived_poems = [poem for poem in poem.derived_poems if poem.is_public]

        if not poem.show_author:
            poem.author_names = []

    return poem


@router.post("/", response_model=PoemPublicWithAllTheInfo)
def create_poem(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    poem_in: PoemCreate,
) -> Any:
    """
    Create new poem.
    """
    poem = poem_crud.create(db=session, obj_create=poem_in)
    if not poem:
        raise HTTPException(status_code=404, detail="Author not found")

    if not poem_in.author_ids and not current_user.is_superuser:
        if current_user.author_id:
            author = author_crud.get_by_id(session, current_user.author_id)

        else:
            author_in = AuthorCreate(full_name=current_user.username)
            author = author_crud.create(db=session, obj_create=author_in)

            user_in = UserUpdate(author_id=author.id)
            current_user = user_crud.update(
                db=session, obj_id=current_user.id, obj_update=user_in
            )  # type: ignore

        poem_update = PoemUpdate(author_ids=[author.id])  # type: ignore
        poem = poem_crud.update(db=session, obj_id=poem.id, obj_update=poem_update)

    if poem_in.type is not None and poem_in.original_poem_id:
        poem_poem_in = PoemPoemCreate(
            type=poem_in.type,
            original_poem_id=poem_in.original_poem_id,
            derived_poem_id=poem.id,  # type: ignore
        )

        poem_poem_crud.create(db=session, obj_create=poem_poem_in)
        poem = poem_crud.get_by_id(session, poem.id) # type: ignore

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
    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if not current_user.is_superuser:
        if (
            current_user.author_id is None
            or current_user.author_id not in poem.author_ids
        ):
            raise HTTPException(status_code=400, detail="Not enough permissions")

    poem = poem_crud.update(db=session, obj_id=poem.id, obj_update=poem_in)
    if not poem:
        raise HTTPException(status_code=404, detail="Author not found")

    if current_user.is_superuser:
        poem_poem = poem_poem_crud.get_by_derived_id(session, poem.id)
        if not poem_poem and poem_in.type is not None and poem_in.original_poem_id:
            poem_poem_in = PoemPoemCreate(
                type=poem_in.type,
                original_poem_id=poem_in.original_poem_id,
                derived_poem_id=poem.id,  # type: ignore
            )
            poem_poem = poem_poem_crud.create(db=session, obj_create=poem_poem_in)
        else:
            poem_poem_in = PoemPoemUpdate()
            if poem_in.type is not None:
                poem_poem_in.type = poem_in.type
            if poem_in.original_poem_id:
                poem_poem_in.original_poem_id = poem_in.original_poem_id

            poem_poem_crud.update(
                db=session, original_id=poem_poem.original_poem_id, derived_id=poem_poem.derived_poem_id, obj_update=poem_poem_in # type: ignore
            )  

        poem = poem_crud.get_by_id(session, poem.id)

    return poem


@router.delete("/{poem_id}")
def delete_poem(
    session: SessionDep, current_user: CurrentUser, poem_id: uuid.UUID
) -> Message:
    """
    Delete a poem.
    """
    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if not current_user.is_superuser:
        if (
            current_user.author_id is None
            or current_user.author_id not in poem.author_ids
        ):
            raise HTTPException(status_code=400, detail="Not enough permissions")

    poem_crud.delete(db=session, obj_id=poem.id)
    return Message(message="Poem deleted successfully")
