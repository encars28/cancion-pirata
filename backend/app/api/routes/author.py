import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.crud import crud_author, crud_poems
from app.api.deps import (
    get_current_active_superuser,
    SessionDep,
    CurrentUser,
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

@router.patch("/me", response_model=AuthorPublic)
def update_author_me(
    *, session: SessionDep, author_in: AuthorUpdate, current_user: CurrentUser
) -> Any:
    """
    Update own author.
    """
    
    author = session.get(Author, current_user.author_id)
    
    if not author:
        raise HTTPException(
            status_code=404, detail="Author not found"
        )

    if author_in.name:
        existing_author = crud_author.get_author_by_name(session=session, name=author_in.name)
        if existing_author and existing_author.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="Author with this name already exists"
            )
            

    author = crud_author.update_author(session=session, author=author, author_in=author_in)
    
    return author

@router.get("/me", response_model=AuthorPublic)
def read_author_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current author.
    """
    author = session.get(Author, current_user.author_id)
    
    if not author:
        raise HTTPException(
            status_code=404, detail="Author not found"
        )
        
    return author


@router.delete("/me", response_model=Message)
def delete_author_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own author.
    """

    author = session.get(Author, current_user.author_id)
    if not author:
        raise HTTPException(
            status_code=404, detail="Author not found"
        )
    
    crud_poems.delete_author_poems(session=session, author_id=current_user.author_id)
    session.delete(author)
    session.commit()
    return Message(message="Author deleted successfully")


@router.get("/{author_id}", response_model=AuthorPublic)
def read_author_by_id(
    author_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
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
        
    if not current_user.is_superuser or author.author_id != current_user.author_id:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
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
def delete_author(
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