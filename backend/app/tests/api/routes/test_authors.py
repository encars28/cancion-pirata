import uuid
from datetime import datetime
from fastapi.encoders import jsonable_encoder

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud.user import user_crud
from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.core.config import settings

from app.schemas.author import AuthorCreate
from app.schemas.user import UserUpdate, UserPublic

from app.tests.utils.utils import random_lower_string
from app.tests.utils.author import create_random_author
from app.tests.utils.poem import create_random_poem
from app.tests.utils.user import authentication_token_from_email


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


def test_get_author_me(
    client: TestClient, user_who_is_author: UserPublic, db: Session
) -> None:
    token_headers = authentication_token_from_email(
        client=client, email=user_who_is_author.email, db=db
    )

    r = client.get(f"{settings.API_V1_STR}/authors/me", headers=token_headers)
    assert r.status_code == 200

    current_author = r.json()
    assert current_author
    assert current_author["id"] == str(user_who_is_author.author_id)


def test_get_author_me_no_author(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/authors/me", headers=normal_user_token_headers
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "Author not found"}


def test_update_author_me(
    client: TestClient, user_who_is_author: UserPublic, db: Session
) -> None:
    token_headers = authentication_token_from_email(
        client=client, email=user_who_is_author.email, db=db
    )

    birth_date = datetime.now()
    name = random_lower_string()
    data = jsonable_encoder({"birth_date": birth_date, "full_name": name})
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_author = r.json()
    assert updated_author["birth_date"] == jsonable_encoder(birth_date)
    assert updated_author["full_name"] == name

    author_db = author_crud.get_by_id(db, user_who_is_author.author_id)
    assert author_db
    assert author_db.birth_date == birth_date
    assert author_db.full_name == name


def test_update_author_me_no_me_author(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    birth_date = datetime.now()
    data = jsonable_encoder({"birth_date": birth_date})
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "Author not found"}


def test_update_author_me_author_already_exists(
    client: TestClient, user_who_is_author: UserPublic, db: Session
) -> None:
    author = create_random_author(db)
    token_headers = authentication_token_from_email(
        client=client, email=user_who_is_author.email, db=db
    )

    data = {"full_name": author.full_name}
    r = client.patch(
        f"{settings.API_V1_STR}/authors/me",
        headers=token_headers,
        json=data,
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "Author with this name already exists"


def test_delete_author_me(
    client: TestClient, db: Session, user_who_is_author: UserPublic
) -> None:
    headers = authentication_token_from_email(
        client=client, email=user_who_is_author.email, db=db
    )
    author_id = user_who_is_author.author_id

    author = author_crud.get_by_id(db, author_id)
    name = author.full_name  # type: ignore

    r = client.delete(
        f"{settings.API_V1_STR}/authors/me",
        headers=headers,
    )

    assert r.status_code == 200
    deleted_author = r.json()
    assert deleted_author["message"] == "Author deleted successfully"
    result = author_crud.get_by_id(db, author_id)
    assert result is None

    author_in = AuthorCreate(full_name=name)
    author = author_crud.create(db=db, obj_create=author_in)
    user_in = UserUpdate(author_id=author.id)
    user_who_is_author = user_crud.update(
        db=db, obj_id=user_who_is_author.id, obj_update=user_in
    )  # type: ignore


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

    existing_author = author_crud.get_by_name(db, author.full_name)
    assert existing_author
    assert existing_author.full_name == api_author["full_name"]

def test_get_existing_author_not_found(
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


def test_create_author_by_normal_user(
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


def test_retrieve_authors(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    create_random_poem(db, author_ids=[author.id], is_public=False)
    create_random_author(db)

    r = client.get(f"{settings.API_V1_STR}/authors/", headers=superuser_token_headers)
    all_authors = r.json()

    assert len(all_authors["data"]) > 1
    assert "count" in all_authors
    for item in all_authors["data"]:
        assert "full_name" in item
        if item["id"] == str(author.id):
            assert len(item["poems"]) > 0


def test_retrieve_authors_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    create_random_poem(db, author_ids=[author.id], is_public=False)
    create_random_author(db)

    r = client.get(f"{settings.API_V1_STR}/authors/", headers=normal_user_token_headers)
    all_authors = r.json()

    assert len(all_authors["data"]) > 1
    assert "count" in all_authors
    for item in all_authors["data"]:
        assert "full_name" in item
        if item["id"] == str(author.id):
            assert len(item["poems"]) == 0


def test_update_author(
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


def test_delete_author_me_no_author(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/authors/me",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "Author not found"}


def test_delete_author_super_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    poem = create_random_poem(db, author_ids=[author.id])
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
