import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.poem import create_random_original_poem, create_random_translation_poem
from app.tests.utils.user import authentication_token_from_email

from app.models import User, Author


def test_read_poems(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_original_poem(db)
    create_random_original_poem(db)
    response = client.get(
        f"{settings.API_V1_STR}/poems/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    
def test_read_translations(
    client: TestClient, user_who_is_author: User, db: Session
) -> None:
    author = db.get(Author, user_who_is_author.author_id)
    poem = create_random_original_poem(db=db)
    create_random_translation_poem(db=db, original=poem, author=author)
    create_random_translation_poem(db=db, original=poem, author=author)
    
    token_headers = authentication_token_from_email(client=client, db=db, email=user_who_is_author.email)
    response = client.get(
        f"{settings.API_V1_STR}/poems/translations",
        headers=token_headers,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2

def test_read_original_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    response = client.get(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == poem.title
    assert content["content"] == poem.content
    assert content["id"] == str(poem.id)
    
def test_read_translation(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_original_poem(db)
    poem = create_random_translation_poem(db, original=original)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/translations/{poem.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == poem.title
    assert content["content"] == poem.content
    assert content["id"] == str(poem.id)
    assert content["original_id"] == str(original.id)

def test_read_poem_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/poems/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Poem not found"
    
def test_read_translation_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/poems/translations/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Poem not found"

def test_read_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    response = client.get(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
    
def test_read_translation_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_original_poem(db)
    poem = create_random_translation_poem(db, original=original)
    response = client.get(
        f"{settings.API_V1_STR}/poems/translations/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"

def test_create_poem(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Foo", "content": "Fighters"}
    response = client.post(
        f"{settings.API_V1_STR}/poems/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    
def test_create_translation(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    original = create_random_original_poem()
    data = {"title": "Foo", "content": "Fighters", "original_id": original.id}
    response = client.post(
        f"{settings.API_V1_STR}/poems/translations",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["original_id"] == str(original.id)
    
def test_create_version(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    original = create_random_original_poem()
    data = {"title": "Foo", "content": "Fighters", "original_id": original.id}
    response = client.post(
        f"{settings.API_V1_STR}/poems/versions",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["original_id"] == str(original.id)
    
def test_update_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    data = {"title": "Updated title", "content": "Updated content"}
    response = client.put(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert content["id"] == str(poem.id)


def test_update_poem_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Updated title", "content": "Updated content"}
    response = client.put(
        f"{settings.API_V1_STR}/poems/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_update_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    data = {"title": "Updated title", "content": "Updated content"}
    response = client.put(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Item deleted successfully"


def test_delete_poem_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_delete_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_original_poem(db)
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"