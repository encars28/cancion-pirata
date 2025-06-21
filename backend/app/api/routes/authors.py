from email.mime import image
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.core.config import settings
import os
from app.api.deps import (
    OptionalCurrentUser,
    get_current_active_author,
    get_current_active_superuser,
    SessionDep,
    CurrentUser,
)

from app.schemas.common import Message
from app.schemas.author import (
    AuthorCreate,
    AuthorPublic,
    AuthorPublicWithPoems,
    AuthorSearchParams,
    AuthorUpdate,
    AuthorUpdateBasic,
    AuthorsPublicWithPoems,
    AuthorsPublic,
)
from app.crud.author import author_crud

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get(
    "/",
    response_model=AuthorsPublicWithPoems,
    dependencies=[Depends(get_current_active_superuser)]
)
def read_authors(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all authors.
    """
    params = AuthorSearchParams(
        author_skip=skip, author_limit=limit
    )

    authors = [
        AuthorPublic.model_validate(author)
        for author in author_crud.get_many(db=session, queryParams=params)
    ]
    count = author_crud.get_count(db=session, queryParams=params)

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

@router.patch(
    "/me",
    response_model=AuthorPublic,
    dependencies=[Depends(get_current_active_author)],
)
def update_author_me(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    author_in: AuthorUpdateBasic,
) -> Any:
    """
    Update own author.
    """
    author = author_crud.get_by_id(session, current_user.author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )

    author = author_crud.update(db=session, obj_id=author.id, obj_update=author_in)
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
        not current_user.is_superuser
        and (not current_user.author_id or not current_user.author_id == author_id)
    ):
        author.poems = [
            poem for poem in author.poems if poem.is_public and poem.show_author
        ]

    return author

@router.post("/{author_id}/picture", response_model=Message, dependencies=[Depends(get_current_active_superuser)])
def upload_author_picture(
    author_id: uuid.UUID,
    session: SessionDep,
    file: UploadFile,
) -> Any:
    """
    Upload a picture for a specific Author by id.
    """
    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(
            status_code=404,
            detail="The author with this id does not exist in the system",
        )

    if not file.content_type or "image" not in file.content_type:
        raise HTTPException(
            status_code=400,
            detail="File is not an image.",
        )
        
    file_path = os.path.join(settings.IMAGES_DIR, "authors", f"{author_id}.png")
    try: 
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except OSError:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save image",
        )

    return Message(message="Profile picture uploaded successfully")


@router.patch(
    "/{author_id}",
    response_model=AuthorPublic,
    dependencies=[Depends(get_current_active_superuser)],
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
def delete_author(
    session: SessionDep, author_id: uuid.UUID
) -> Message:
    """
    Delete a Author.
    """
    author = author_crud.get_by_id(session, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    author_crud.delete(db=session, obj_id=author.id)
    return Message(message="Author deleted successfully")
