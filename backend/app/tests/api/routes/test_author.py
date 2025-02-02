import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.crud import crud_author
from app.core.config import settings

from app.models import Author, OriginalPoem, PoemTranslation
from app.tests.utils.utils import random_lower_string
from app.tests.utils.poem import create_random_author


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
    author = crud_author.get_author_by_name(session=db, name=name)
    assert author
    assert author.name == created_author["name"]


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
    
    existing_author = crud_author.get_author_by_name(session=db, name=author.name)
    assert existing_author
    assert existing_author.name == api_author["name"]


def test_get_existing_author_permissions_error(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/authors/{uuid.uuid4()}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json() == {"detail": "The user doesn't have enough privileges"}


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

    author_query = select(Author).where(Author.name == author.name)
    author_db = db.exec(author_query).first()
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
    result = db.exec(select(Author).where(Author.id == author_id)).first()
    assert result is None
    poems = db.exec(select(OriginalPoem).where(OriginalPoem.author_id == author_id)).all()
    assert poems == []
    translations = db.exec(select(PoemTranslation).where(PoemTranslation.author_id == author_id)).all()
    assert translations == []


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