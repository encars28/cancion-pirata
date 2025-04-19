import uuid
from datetime import datetime
from fastapi.encoders import jsonable_encoder

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.core.config import settings

from app.tests.utils.utils import random_lower_string
from app.tests.utils.author import create_random_author
from app.tests.utils.poem import create_random_poem
from app.tests.utils.user import authentication_token_from_email


# READ


def test_retrieve_authors_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author1 = create_random_author(db)
    poem1 = create_random_poem(db, author_names=[author1.full_name], is_public=False)
    author2 = create_random_author(db)

    r = client.get(f"{settings.API_V1_STR}/authors/", headers=superuser_token_headers)
    all_authors = r.json()

    assert len(all_authors["data"]) == 2
    assert "count" in all_authors
    for item in all_authors["data"]:
        assert "full_name" in item
        assert item["id"] in [str(author1.id), str(author2.id)]
        if item["id"] == str(author1.id):
            assert len(item["poems"]) == 1
            assert item["poems"][0]["id"] == str(poem1.id)


def test_retrieve_authors_as_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    author1 = create_random_author(db)
    poem1 = create_random_poem(db, author_names=[author1.full_name])
    author2 = create_random_author(db)

    r = client.get(f"{settings.API_V1_STR}/authors/", headers=normal_user_token_headers)
    all_authors = r.json()

    assert len(all_authors["data"]) == 2
    assert "count" in all_authors
    for item in all_authors["data"]:
        assert "full_name" in item
        assert "poems" not in item
        assert item["id"] in [str(author1.id), str(author2.id)]


# CREATE AUTHOR


def test_create_author(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    name = random_lower_string()
    data = {"full_name": name, "birth_date": jsonable_encoder(datetime.now())}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=superuser_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300
    created_author = r.json()
    author = author_crud.get_by_name(db, name)
    assert author
    assert author.full_name == created_author["full_name"]
    assert jsonable_encoder(author.birth_date) == created_author["birth_date"]


def test_create_author_existing_name(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    data = {"full_name": author.full_name}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=superuser_token_headers,
        json=data,
    )
    created_author = r.json()
    assert r.status_code == 400
    assert "_id" not in created_author


def test_create_author_without_priviledges(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    name = random_lower_string()
    data = {"full_name": name}
    r = client.post(
        f"{settings.API_V1_STR}/authors/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 403


# READ BY ID


def test_read_author_with_poems_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    poem = create_random_poem(db, author_names=[author.full_name], is_public=False)

    author_id = author.id
    r = client.get(
        f"{settings.API_V1_STR}/authors/{author_id}",
        headers=superuser_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_author = r.json()

    assert author.full_name == api_author["full_name"]
    assert api_author["id"] == str(author.id)
    assert len(api_author["poems"]) == 1
    assert api_author["poems"][0]["id"] == str(poem.id)


def test_read_author_with_poems_as_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    poem1 = create_random_poem(db, author_names=[author.full_name], is_public=False)

    r = client.get(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=normal_user_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_author = r.json()

    assert api_author["full_name"] == author.full_name
    assert api_author["id"] == str(author.id)
    assert len(api_author["poems"]) == 0


def test_read_author_not_found(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/authors/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )

    assert r.status_code == 404
    assert r.json() == {
        "detail": "The author with this id does not exist in the system"
    }


# UPDATE


def test_update_author_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)

    birth_date = datetime.now()
    data = jsonable_encoder({"birth_date": birth_date})
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_author = r.json()

    assert updated_author["birth_date"] == jsonable_encoder(birth_date)

    author_db = author_crud.get_by_name(db, author.full_name)
    assert author_db
    assert author_db.birth_date == birth_date


def test_update_author_as_current_author(
    client: TestClient, user_who_is_author, db: Session
) -> None:
    token = authentication_token_from_email(
        client=client, db=db, email=user_who_is_author.email
    )

    author = author_crud.get_by_id(db, user_who_is_author.author_id)
    assert author

    birth_date = datetime.now()
    data = jsonable_encoder({"birth_date": birth_date})
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=token,
        json=data,
    )
    assert r.status_code == 200
    updated_author = r.json()

    assert updated_author["birth_date"] == jsonable_encoder(birth_date)

    author_db = author_crud.get_by_name(db, author.full_name)
    assert author_db
    assert author_db.birth_date == birth_date


def test_update_author_without_priviledges(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)

    birth_date = datetime.now()
    data = jsonable_encoder({"birth_date": birth_date})
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"


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

    data = {"full_name": author2.full_name}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "Author with this name already exists"


# DELETE


def test_delete_author_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    poem = create_random_poem(db, author_names=[author.full_name])
    poem_id = poem.id
    author_id = author.id
    r = client.delete(
        f"{settings.API_V1_STR}/authors/{author_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    deleted_author = r.json()
    assert deleted_author["message"] == "Author deleted successfully"
    result = author_crud.get_by_id(db, author_id)
    assert result is None
    result = poem_crud.get_by_id(db, poem_id)
    assert result is None


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
    author = create_random_author(db)

    r = client.delete(
        f"{settings.API_V1_STR}/authors/{author.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"
