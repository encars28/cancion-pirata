import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import (
    OptionalCurrentUser,
    SessionDep,
    CurrentUser,
)

from app.schemas.common import Message
from app.schemas.collection import (
    CollectionCreate,
    CollectionPublic,
    CollectionUpdate,
)
from app.crud.collection import collection_crud

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post(
    "/",
    response_model=CollectionPublic,
)
def create_collection(*, session: SessionDep, collection_in: CollectionCreate, current_user: CurrentUser ) -> Any:
    """
    Create new Collection.
    """
    if collection_in.user_id: 
        raise HTTPException(
            status_code=400,
            detail="User ID should not be provided in the request body. It will be set automatically.",
        )
    
    collection_in.user_id = current_user.id
    collection = collection_crud.create(db=session, obj_create=collection_in)
    return collection


@router.get("/{collection_id}", response_model=CollectionPublic)
def read_collection_by_id(
    collection_id: uuid.UUID, session: SessionDep, current_user: OptionalCurrentUser
) -> Any:
    """
    Get a specific Collection by id.
    """
    collection = collection_crud.get_by_id(session, collection_id)
    if not collection:
        raise HTTPException(
            status_code=404,
            detail="The collection with this id does not exist in the system",
        )

    # Normal user
    if not current_user or (
        not current_user.is_superuser
        and (not current_user.id == collection.user_id)
    ):
        collection.poems = [
            poem for poem in collection.poems if poem.is_public
        ]
        
        for poem in collection.poems: 
            if not poem.show_author and (
                not current_user
                or not current_user.author_id
                or current_user.author_id not in poem.author_ids
            ):
                poem.author_names = []
        
    return collection


@router.patch(
    "/{collection_id}",
    response_model=CollectionPublic,
)
def update_collection(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    collection_in: CollectionUpdate,
) -> Any:
    """
    Update an Collection.
    """

    collection = collection_crud.get_by_id(session, collection_id)
    if not collection:
        raise HTTPException(
            status_code=404,
            detail="The collection with this id does not exist in the system",
        )

    if not current_user.is_superuser and (
        not collection.user_id == current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    collection = collection_crud.update(db=session, obj_id=collection.id, obj_update=collection_in)
    return collection


@router.delete("/{collection_id}")
def delete_collection(
    session: SessionDep, current_user: CurrentUser, collection_id: uuid.UUID
) -> Message:
    """
    Delete a Collection.
    """
    collection = collection_crud.get_by_id(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    if not current_user.is_superuser and (
        not collection.user_id == current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    collection_crud.delete(db=session, obj_id=collection.id)
    return Message(message="Collection deleted successfully")
