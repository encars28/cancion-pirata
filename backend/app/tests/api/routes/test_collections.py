import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.config import settings

from app.crud.collection import collection_crud

from app.schemas.collection import CollectionUpdate
from app.tests.utils.user import authentication_token_from_email, create_random_user
from app.tests.utils.utils import random_lower_string
from app.tests.utils.poem import create_random_poem
from app.tests.utils.collection import create_random_collection



def test_create_collection(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    name = random_lower_string()
    description = random_lower_string()
    
    poem1 = create_random_poem(db, is_public=True)
    poem2 = create_random_poem(db, is_public=True)
    
    data = {"name": name, "description": description, "poem_ids": [poem1.id, poem2.id]}
    r = client.post(
        f"{settings.API_V1_STR}/collections/",
        headers=normal_user_token_headers,
        json=data,
    )
    
    assert 200 <= r.status_code < 300
    created_collection = r.json()
    assert created_collection["name"] == name
    assert created_collection["description"] == description
    assert len(created_collection["poems"]) == 2
    
    
def test_create_collection_with_userid(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    name = random_lower_string()
    
    data = {"name": name, "user_id": uuid.uuid4()}
    r = client.post(
        f"{settings.API_V1_STR}/collections/",
        headers=normal_user_token_headers,
        json=data,
    )
    
    assert r.status_code == 400
    assert r.json() == {
        "detail": "User ID should not be provided in the request body. It will be set automatically."
    }


def test_read_collection(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)

    collection_id = collection.id
    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_collection = r.json()

    assert api_collection["name"] == collection.name
    assert api_collection["id"] == str(collection.id)
    assert api_collection["description"] == collection.description
    assert api_collection["poems"] == collection.poems


def test_read_collection_not_found(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/collections/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )

    assert r.status_code == 404
    assert r.json() == {
        "detail": "The collection with this id does not exist in the system"
    }

def test_read_collection_not_public_as_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id, is_public=False)

    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json() == {
        "detail": "The collection is not public and the user doesn't have enough privileges"
    }
    
def test_read_collection_not_public_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id, is_public=False)

    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=superuser_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_collection = r.json()

    assert api_collection["name"] == collection.name
    assert api_collection["id"] == str(collection.id)
    assert api_collection["description"] == collection.description
    assert api_collection["poems"] == collection.poems
    
    
def test_read_collection_with_private_poems(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id, is_public=True)
    
    # Add a private poem to the collection
    private_poem = create_random_poem(db, is_public=False)
    collection = collection_crud.update(
        db,
        obj_id=collection.id,
        obj_update=CollectionUpdate(poem_ids=collection.poem_ids.union({private_poem.id})),
    )
    
    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}", # type: ignore
        headers=normal_user_token_headers,
    )
    
    assert r.status_code == 200
    api_collection = r.json()
    
    # The private poem should not be included in the response
    assert len(api_collection["poems"]) == len(collection.poems) - 1 # type: ignore
    
def test_read_collection_with_private_poems_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id, is_public=True)
    
    # Add a private poem to the collection
    private_poem = create_random_poem(db, is_public=False)
    collection = collection_crud.update(
        db,
        obj_id=collection.id,
        obj_update=CollectionUpdate(poem_ids=collection.poem_ids.union({private_poem.id})),
    )
    
    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}", # type: ignore
        headers=superuser_token_headers,
    )
    
    assert r.status_code == 200
    api_collection = r.json()
    
    # The private poem should be included in the response for admin
    assert len(api_collection["poems"]) == len(collection.poems) # type: ignore
    
    
def test_read_collection_not_public_as_collection_user(
    client: TestClient,
    db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id, is_public=False)

    collection_user_token_headers = authentication_token_from_email(
        client=client, email=user.email, db=db
    )
    r = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=collection_user_token_headers,
    )
    assert r.status_code == 200
    api_collection = r.json()
    assert api_collection["name"] == collection.name
    assert api_collection["id"] == str(collection.id)
    assert api_collection["description"] == collection.description
    assert api_collection["poems"] == collection.poems



def test_update_collection_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)

    data = {"name": "Updated Collection Name", "description": "Updated description", "poem_ids": []}
    
    r = client.patch(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_collection = r.json()

    assert updated_collection["name"] == data["name"]
    assert updated_collection["description"] == data["description"]
    assert updated_collection["poems"] == []


def test_update_collection_as_owner(
    client: TestClient,
    db: Session,
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)
    collection_user_token_headers = authentication_token_from_email(
        client=client, email=user.email, db=db
    )
    
    data = {"name": "Updated Collection Name", "description": "Updated description", "poem_ids": []}
    
    r = client.patch(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=collection_user_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_collection = r.json()

    assert updated_collection["name"] == data["name"]
    assert updated_collection["description"] == data["description"]
    assert updated_collection["poems"] == []


def test_update_collection_without_priviledges(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)

    description = random_lower_string()
    data = {"description": description}
    
    r = client.patch(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"


def test_update_collection_not_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "a"}
    r = client.patch(
        f"{settings.API_V1_STR}/collections/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "The collection with this id does not exist in the system"


# DELETE


def test_delete_collection_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)

    collection_id = collection.id
    r = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    deleted_collection = r.json()
    assert deleted_collection["message"] == "Collection deleted successfully"
    result = collection_crud.get_by_id(db, collection_id)
    assert result is None


def test_delete_collection_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/collections/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Collection not found"


def test_delete_collection_without_privileges(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    collection = create_random_collection(db, user.id)

    r = client.delete(
        f"{settings.API_V1_STR}/collections/{collection.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"
    