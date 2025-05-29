import uuid
from typing import Any
from fastapi import APIRouter, HTTPException

from app.api.deps import (
    CurrentUser,
    OptionalCurrentUser,
    PoemQuery,
    SessionDep,
)

from app.poem_parser import PoemParser
from app.schemas.author import AuthorCreate
from app.schemas.poem import (
    PoemCreate,
    PoemPublicWithAuthor,
    PoemUpdate,
    PoemPublicWithAllTheInfo,
    PoemsPublic,
)
from app.schemas.common import Message

from app.crud.poem import poem_crud
from app.crud.author import author_crud

router = APIRouter(prefix="/poems", tags=["poems"])


@router.get("", response_model=PoemsPublic)
def read_poems(
    session: SessionDep, current_user: OptionalCurrentUser, queryParams: PoemQuery
) -> Any:
    """
    Retrieve all poems.
    """
    if current_user and current_user.is_superuser:
        # retrieve all poems
        count = poem_crud.get_count(
            session, queryParams=queryParams, public_restricted=False
        )
        poems = [
            PoemPublicWithAuthor.model_validate(poem)
            for poem in poem_crud.get_many(
                session, queryParams=queryParams, public_restricted=False
            )
        ]

    # Retrieve public poems
    else:
        count = poem_crud.get_count(session, queryParams=queryParams)
        poems = [
            PoemPublicWithAuthor.model_validate(poem)
            for poem in poem_crud.get_many(session, queryParams=queryParams)
        ]

    return PoemsPublic(data=poems, count=count)


@router.get("/random", response_model=PoemPublicWithAllTheInfo)
def read_random_poem(session: SessionDep, current_user: OptionalCurrentUser) -> Any:
    """
    Get a random poem.
    """
    poem = poem_crud.get_random(session)
    if not poem:
        raise HTTPException(status_code=404, detail="No poem found")

    if current_user and current_user.is_superuser:
        poem.content = PoemParser(poem.content).to_html()
        return poem

    if not poem.show_author and (
        not current_user
        or not current_user.author_id
        or current_user.author_id not in poem.author_ids
    ):
        poem.author_names = []

    poem.derived_poems = [poem for poem in poem.derived_poems if poem.is_public]
    poem.content = PoemParser(poem.content).to_html()
    return poem


@router.get("/{poem_id}", response_model=PoemPublicWithAllTheInfo)
def read_poem(
    session: SessionDep,
    current_user: OptionalCurrentUser,
    poem_id: uuid.UUID,
    parse_content: bool = True,
) -> Any:
    """
    Get poem by ID.
    """
    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if current_user and current_user.is_superuser:
        poem.content = PoemParser(poem.content).to_html()
        return poem

    if not poem.is_public and (
        not current_user
        or not current_user.author_id
        or current_user.author_id not in poem.author_ids
    ):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    if not poem.show_author and (
        not current_user
        or not current_user.author_id
        or current_user.author_id not in poem.author_ids
    ):
        poem.author_names = []

    poem.derived_poems = [poem for poem in poem.derived_poems if poem.is_public]
    if parse_content:
        poem.content = PoemParser(poem.content).to_html()
    
    print(parse_content)
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
