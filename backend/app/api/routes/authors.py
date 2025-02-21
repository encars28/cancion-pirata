import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import (
    get_current_active_superuser,
    SessionDep,
    CurrentUser,
)

from app.schemas.common import Message
from app.schemas.author import (
    AuthorCreate,
    AuthorPublicWithPoems,
    AuthorUpdate,
    AuthorsPublic,
)
from app.crud.author import author_crud

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorsPublic,
)
def read_authors(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve all authors.
    """

    count = author_crud.get_count(db=session)
    authors = [
        AuthorPublicWithPoems.model_validate(author)
        for author in author_crud.get_all(db=session, skip=skip, limit=limit)
    ]

    return AuthorsPublic(data=authors, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorPublicWithPoems,
)
def create_author(*, session: SessionDep, author_in: AuthorCreate) -> Any:
    """
    Create new Author.
    """
    author = author_crud.get_by_name(session, author_in.full_name)
    if author:
        raise HTTPException(
            status_code=400,
            detail="The author with this full_name already exists in the system.",
        )

    author = author_crud.create(db=session, obj_create=author_in)
    return author


@router.patch("/me", response_model=AuthorPublicWithPoems)
def update_author_me(
    *, session: SessionDep, author_in: AuthorUpdate, current_user: CurrentUser
) -> Any:
    """
    Update own author.
    """
    author = author_crud.get_by_id(session, current_user.author_id)

    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    if author_in.full_name:
        existing_author = author_crud.get_by_name(session, author_in.full_name)
        if existing_author and existing_author.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="Author with this name already exists"
            )

    author = author_crud.update(db=session, obj_id=author.id, obj_update=author_in)
    return author


@router.get("/me", response_model=AuthorPublicWithPoems)
def read_author_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get own author.
    """
    author = author_crud.get_by_id(session, current_user.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    return author


@router.delete("/me", response_model=Message)
def delete_author_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own author.
    """

    author = author_crud.get_by_id(session, current_user.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    author_crud.delete(db=session, obj_id=author.id)
    return Message(message="Author deleted successfully")


@router.get("/{author_id}", response_model=AuthorPublicWithPoems)
def read_author_by_id(
    author_id: uuid.UUID, session: SessionDep
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

    return author


@router.patch(
    "/{author_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorPublicWithPoems,
)
def update_author(
    *,
    session: SessionDep,
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

    if author_in.full_name:
        existing_author = author_crud.get_by_name(session, author_in.full_name)
        if existing_author and existing_author.id != author_id:
            raise HTTPException(
                status_code=409, detail="Author with this name already exists"
            )

    author = author_crud.update(db=session, obj_id=author.id, obj_update=author_in)
    return author


@router.delete("/{author_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_author(session: SessionDep, author_id: uuid.UUID) -> Message:
    """
    Delete a Author.
    """
    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    author_crud.delete(db=session, obj_id=author.id)
    return Message(message="Author deleted successfully")
