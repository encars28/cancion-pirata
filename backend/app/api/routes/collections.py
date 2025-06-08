import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Depends

from app.api.deps import (
    OptionalCurrentUser,
    SessionDep,
    CurrentUser,
    get_current_active_superuser,
)

from app.schemas.common import Message
from app.schemas.collection import (
    CollectionCreate,
    CollectionSearchParams,
    CollectionUpdate,
    CollectionsPublic,
    CollectionPublicWithPoems
)
from app.crud.collection import collection_crud
from app.crud.poem import poem_crud

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("/", response_model=CollectionsPublic, dependencies=[Depends(get_current_active_superuser)])
def read_collections(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all Collections.
    """
    params = CollectionSearchParams(
        collection_skip=skip, collection_limit=limit
    )
    collections = [CollectionPublicWithPoems.model_validate(collection) for collection in collection_crud.get_many(
        session, params, public_restricted=False
    )]
    count = collection_crud.get_count(
        session, params, public_restricted=False)

    return CollectionsPublic(data=collections, count=count)


@router.post(
    "/",
    response_model=CollectionPublicWithPoems,
)
def create_collection(
    *, session: SessionDep, collection_in: CollectionCreate, current_user: CurrentUser
) -> Any:
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


@router.get("/{collection_id}", response_model=CollectionPublicWithPoems)
def read_collection(
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

    if not collection.is_public and (
        not current_user
        or (not current_user.is_superuser and current_user.id != collection.user_id)
    ):
        raise HTTPException(
            status_code=403,
            detail="The collection is not public and the user doesn't have enough privileges",
        )

    # Normal user
    if not current_user or (not current_user.is_superuser):
        # Show only public poems or private ones if the user is the author
        collection.poems = [
            poem
            for poem in collection.poems
            if poem.is_public
            or (
                current_user
                and current_user.author_id
                and current_user.author_id in poem.author_ids
            )
        ]

        # Hide author names if the user is not the author
        for poem in collection.poems:
            if not poem.show_author and (
                not current_user
                or not current_user.author_id
                or current_user.author_id not in poem.author_ids
            ):
                poem.author_names = []
                poem.author_ids = []

    return collection


@router.patch(
    "/{collection_id}",
    response_model=CollectionPublicWithPoems,
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

    if not current_user.is_superuser and (not collection.user_id == current_user.id):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    collection = collection_crud.update(
        db=session, obj_id=collection.id, obj_update=collection_in
    )

    return collection


@router.put("/{collection_id}/poems/{poem_id}", response_model=CollectionPublicWithPoems)
def add_poem_to_collection(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    poem_id: uuid.UUID,
) -> Any:
    """
    Add a poem to a Collection.
    """
    collection = collection_crud.get_by_id(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if not current_user.is_superuser and (not collection.user_id == current_user.id):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    if poem_id in collection.poem_ids:
        return collection

    updated_collection = collection_crud.update(
        db=session,
        obj_id=collection.id,
        obj_update=CollectionUpdate(poem_ids=collection.poem_ids + [poem_id]),
    )

    if not updated_collection:
        raise HTTPException(
            status_code=400,
            detail="Failed to add poem to collection. Please check the poem and collection IDs.",
        )

    return updated_collection


@router.delete("/{collection_id}/poems/{poem_id}")
def remove_poem_from_collection(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    poem_id: uuid.UUID,
) -> Any:
    """
    Remove a poem from a Collection.
    """
    collection = collection_crud.get_by_id(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    poem = poem_crud.get_by_id(session, poem_id)
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    if not current_user.is_superuser and (not collection.user_id == current_user.id):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    if poem_id not in collection.poem_ids:
        raise HTTPException(
            status_code=400,
            detail="The poem is not in the collection",
        )

    updated_collection = collection_crud.update(
        db=session,
        obj_id=collection.id,
        obj_update=CollectionUpdate(
            poem_ids=[pid for pid in collection.poem_ids if pid != poem_id]
        ),
    )

    if not updated_collection:
        raise HTTPException(
            status_code=400,
            detail="Failed to remove poem from collection. Please check the poem and collection IDs.",
        )

    return Message(message="Poem removed successfully")


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

    if not current_user.is_superuser and (not collection.user_id == current_user.id):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    collection_crud.delete(db=session, obj_id=collection.id)
    return Message(message="Collection deleted successfully")
