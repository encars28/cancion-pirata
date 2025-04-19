import uuid
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, OptionalCurrentUser, PoemFilterQuery, SessionDep

from app.schemas.author import AuthorCreate
from app.schemas.poem import (
    PoemCreate,
    PoemPublicBasic,
    PoemPublicWithAuthor,
    PoemSchema,
    PoemUpdate,
    PoemPublicWithAllTheInfo,
    PoemsPublic,
    PoemsPublicBasic,
)
from app.schemas.common import Message

from app.crud.poem import poem_crud
from app.crud.author import author_crud

router = APIRouter(prefix="/poems", tags=["poems"])


@router.get("/", response_model=PoemsPublic | PoemsPublicBasic)
def read_poems(
    session: SessionDep,
    current_user: OptionalCurrentUser,
    queryParams: PoemFilterQuery
) -> Any:
    """
    Retrieve all poems.
    """
    if current_user and current_user.is_superuser:
        # retrieve all poems
        count = poem_crud.get_count(session)
        poems = poem_crud.get_all(session, queryParams=queryParams)
        poems = [PoemPublicWithAuthor.model_validate(poem) for poem in poems]
        return PoemsPublic(data=poems, count=count)

    # Retrieve public poems
    count = poem_crud.get_public_count(session)
    poems = poem_crud.get_all_public(session, queryParams=queryParams) 
    poems = [PoemPublicBasic.model_validate(poem) for poem in poems]

    return PoemsPublicBasic(data=poems, count=count)

@router.get("/search", response_model=list[PoemSchema])
def search_poems(
    session: SessionDep,
    query: Annotated[str, Query()],
    col: Annotated[str, Query()],
) -> Any:
    """
    Search poems by title or content.
    """
    return poem_crud.search(session, query=query, col=col)

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
    if not current_user.is_superuser:
        if poem_in.author_names:
            raise HTTPException(
                status_code=400,
                detail="You don't have enough permissions to assign authors",
            )

        if not current_user.author_id:
            author_in = AuthorCreate(full_name=current_user.username)
            author = author_crud.create(db=session, obj_create=author_in)

        else:
            author = author_crud.get_by_id(session, current_user.author_id)
            if not author:
                raise HTTPException(status_code=404, detail="Author not found")

        poem_in.author_names = [author.full_name]

    poem = poem_crud.create(db=session, obj_create=poem_in)
    if not poem:
        raise HTTPException(status_code=404, detail="Author not found")

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

        if poem_in.author_names or poem_in.original_poem_id or poem_in.type is not None:
            raise HTTPException(
                status_code=400,
                detail="You don't have enough permissions",
            )

    poem = poem_crud.update(db=session, obj_id=poem.id, obj_update=poem_in)
    if not poem:
        raise HTTPException(status_code=404, detail="Author not found")

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


    