import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import (
    OptionalCurrentUser,
    get_current_active_superuser,
    SessionDep,
    CurrentUser,
)

from app.schemas.common import Message
from app.schemas.author import (
    AuthorCreate,
    AuthorPublic,
    AuthorPublicBasic,
    AuthorPublicWithPoems,
    AuthorUpdate,
    AuthorsPublic,
    AuthorsPublicWithPoems,
)
from app.crud.author import author_crud

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get(
    "/",
    response_model=AuthorsPublic | AuthorsPublicWithPoems,
)
def read_authors(
    session: SessionDep,
    current_user: OptionalCurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all authors.
    """

    count = author_crud.get_count(db=session)
    authors = author_crud.get_all(db=session, skip=skip, limit=limit)

    # Admin
    if current_user and current_user.is_superuser: 
        authors = [AuthorPublicWithPoems.model_validate(author) for author in authors]
        return AuthorsPublicWithPoems(data=authors, count=count)
    
    # Normal user
    authors = [AuthorPublicBasic.model_validate(author) for author in authors]
    return AuthorsPublic(data=authors, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorPublic,
)
def create_author(*, session: SessionDep, author_in: AuthorCreate) -> Any:
    """
    Create new Author.
    """
    author = author_crud.get_by_name(session, author_in.full_name)
    if author:
        raise HTTPException(
            status_code=400,
            detail="The author with this name already exists in the system.",
        )

    author = author_crud.create(db=session, obj_create=author_in)
    return author


@router.get("/{author_id}", response_model=AuthorPublicWithPoems)
def read_author_by_id(
    author_id: uuid.UUID, session: SessionDep, current_user: OptionalCurrentUser
) -> Any:
    """
    Get a specific Author by id.
    """
    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )

    # Normal user
    if not current_user or (
        not current_user.is_superuser and (
            not current_user.author_id or not current_user.author_id == author_id
        )
    ):
        author.poems = [
            poem for poem in author.poems if poem.is_public and poem.show_author
        ]

    return author


@router.patch(
    "/{author_id}",
    response_model=AuthorPublic,
)
def update_author(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    author_id: uuid.UUID,
    author_in: AuthorUpdate,
) -> Any:
    """
    Update an Author.
    """

    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )

    if not current_user.is_superuser and (
        not current_user.author_id or not current_user.author_id == author_id
    ):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    if author_in.full_name:
        existing_author = author_crud.get_by_name(session, author_in.full_name)
        if existing_author and existing_author.id != author_id:
            raise HTTPException(
                status_code=409, detail="Author with this name already exists"
            )

    author = author_crud.update(db=session, obj_id=author.id, obj_update=author_in)
    return author


@router.delete("/{author_id}")
def delete_author(
    session: SessionDep, current_user: CurrentUser, author_id: uuid.UUID
) -> Message:
    """
    Delete a Author.
    """
    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    if not current_user.is_superuser and (
        not current_user.author_id or not current_user.author_id == author_id
    ):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    author_crud.delete(db=session, obj_id=author.id)
    return Message(message="Author deleted successfully")
