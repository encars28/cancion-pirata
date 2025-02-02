import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.crud import crud_author, crud_poems
from app.api.deps import (
    get_current_active_superuser,
    SessionDep,
)

from app.models import (
    Message,
    Author,
    AuthorCreate,
    AuthorPublic,
    AuthorsPublic,
    AuthorUpdate,
)

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorsPublic,
)
def read_authors(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve authors.
    """

    count_statement = select(func.count()).select_from(Author)
    count = session.exec(count_statement).one()

    statement = select(Author).offset(skip).limit(limit)
    authors = session.exec(statement).all()

    return AuthorsPublic(data=authors, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=AuthorPublic
)
def create_author(*, session: SessionDep, author_in: AuthorCreate) -> Any:
    """
    Create new Author.
    """
    author = crud_author.get_author_by_name(session=session, name=author_in.name)
    if author:
        raise HTTPException(
            status_code=400,
            detail="The author with this name already exists in the system.",
        )

    author = crud_author.create_author(session=session, author_in=author_in)

    return author

@router.get("/{author_id}", dependencies=[Depends(get_current_active_superuser)], response_model=AuthorPublic)
def read_author_by_id(
    author_id: uuid.UUID, session: SessionDep
) -> Any:
    """
    Get a specific Author by id.
    """
    author = session.get(Author, author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )
    return author


@router.patch(
    "/{author_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AuthorPublic,
)
def update_author(
    *,
    session: SessionDep,
    author_id: uuid.UUID,
    author_in: AuthorUpdate,
) -> Any:
    """
    Update a Author.
    """

    author = session.get(Author, author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )
        
    if author.name:
        existing_author = crud_author.get_author_by_name(session=session, name=author_in.name)
        if existing_author and existing_author.id != author_id:
            raise HTTPException(
                status_code=409, detail="Author with this name already exists"
            )

    author = crud_author.update_author(session=session, author=author, author_in=author_in)
    return author


@router.delete("/{author_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, author_id: uuid.UUID
) -> Message:
    """
    Delete a Author.
    """
    author = session.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    crud_poems.delete_author_poems(session=session, author_id=author_id)
    session.delete(author)
    session.commit()
    return Message(message="Author deleted successfully")