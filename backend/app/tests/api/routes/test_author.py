import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.crud.user import user_crud
from app.crud.author import author_crud
from app.core.config import settings

from app.models.author import Author
from app.schemas.author import AuthorCreate
from app.models.poem import Poem
from app.models.user import User
from app.schemas.user import UserUpdate

from app.tests.utils.utils import random_lower_string
from app.tests.utils.author import create_random_author
from app.tests.utils.user import authentication_token_from_email


def test_create_author(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    name = random_lower_string()
    data = {"name": name}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=superuser_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300
    created_author = r.json()
    author = author_crud.get_one(db, Author.full_name == name)
    assert author
    assert author.name == created_author["name"]

def test_get_author_me(
    client: TestClient, user_who_is_author: User, db: Session
) -> None:
    token_headers = authentication_token_from_email(client=client, email=user_who_is_author.email, db=db)
    
    r = client.get(f"{settings.API_V1_STR}/authors/me", headers=token_headers)
    assert r.status_code == 200
    
    current_author = r.json()
    assert current_author
    assert current_author["id"] == str(user_who_is_author.author_id)

def test_get_author_me_no_author(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/authors/me", headers=normal_user_token_headers)
    assert r.status_code == 404
    assert r.json() == {"detail": "Author not found"}

def test_update_author_me(
    client: TestClient, user_who_is_author: User, db: Session
) -> None:
    token_headers = authentication_token_from_email(client=client, email=user_who_is_author.email, db=db)
    
    birth_year = 1990
    data = {"birth_year": birth_year}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_author = r.json()
    assert updated_author["birth_year"] == birth_year

    author_db = db.get(Author, user_who_is_author.author_id)
    assert author_db
    assert author_db.birth_year == birth_year
    
def test_update_author_me_no_author(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {"birth_year": 1990}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "Author not found"}

def test_update_author_me_author_exists(
    client: TestClient, user_who_is_author: User, db: Session
) -> None:
    author = create_random_author(db)
    token_headers = authentication_token_from_email(client=client, email=user_who_is_author.email, db=db)  

    data = {"name": author.name}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=token_headers,
        json=data,
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "Author with this name already exists"
    
def test_delete_author_me(client: TestClient, db: Session, user_who_is_author: User) -> None:
    headers = authentication_token_from_email(client=client, email=user_who_is_author.email, db=db)
    author_id = user_who_is_author.author_id
    
    author = db.get(Author, author_id)
    name = author.name # type: ignore

    r = client.delete(
        f"{settings.API_V1_STR}/authors/me",
        headers=headers,
    )
    
    assert r.status_code == 200
    deleted_author = r.json()
    assert deleted_author["message"] == "Author deleted successfully"
    result = db.get(Author, author_id)
    assert result is None
    
    author_in = AuthorCreate(full_name=name)
    author = author_crud.create(db=db, obj_create=author_in)
    user_in = UserUpdate(author_id=author.id)
    user_who_is_author = user_crud.update(db=db, db_obj=user_who_is_author, obj_update=user_in)
    

def test_get_existing_author(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    author_id = author.id
    r = client.get(
        f"{settings.API_V1_STR}/authors/{author_id}",
        headers=superuser_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_author = r.json()
    
    existing_author = author_crud.get_one(db, Author.full_name == author.name)
    assert existing_author
    assert existing_author.name == api_author["name"]


def test_get_existing_author_permissions_error(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    r = client.get(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json() == {"detail": "The user doesn't have enough privileges"}

def test_get_existing_author_not_found(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
        
    r = client.get(
        f"{settings.API_V1_STR}/authors/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    
    assert r.status_code == 404
    assert r.json() == {"detail": "The author with this id does not exist in the system"}

def test_create_author_existing_name(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    data = {"name": author.name}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=superuser_token_headers,
        json=data,
    )
    created_author = r.json()
    assert r.status_code == 400
    assert "_id" not in created_author


def test_create_author_by_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    name = random_lower_string()
    data = {"name": name}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 403


def test_retrieve_authors(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    
    create_random_author(db)
    create_random_author(db)

    r = client.get(f"{settings.API_V1_STR}/authors/", headers=superuser_token_headers)
    all_authors = r.json()

    assert len(all_authors["data"]) > 1
    assert "count" in all_authors
    for item in all_authors["data"]:
        assert "name" in item


def test_update_author(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)

    data = {"birth_year": 2000}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_author = r.json()

    assert updated_author["birth_year"] == 2000

    author_db = author_crud.get_one(db, Author.full_name == author.name)
    db.refresh(author_db)
    assert author_db
    assert author_db.birth_year == 2000

def test_update_author_not_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"birth_year": 2000}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "The author with this id does not exist in the system"


def test_update_author_name_exists(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    author2 = create_random_author(db)

    data = {"name": author2.name}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "Author with this name already exists"


def test_delete_author_super_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    author_id = author.id
    r = client.delete(
        f"{settings.API_V1_STR}/authors/{author_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    deleted_author = r.json()
    assert deleted_author["message"] == "Author deleted successfully"
    result = db.get(Author, author_id)
    assert result is None
    #TODO: Check if poems are deleted as well


def test_delete_author_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/authors/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Author not found"


def test_delete_author_without_privileges(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    create_random_author(db)

    r = client.delete(
        f"{settings.API_V1_STR}/authors/{Author.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"