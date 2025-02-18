import random
import uuid
from venv import create

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.poem import create_random_poem, create_random_translation
from app.tests.utils.user import authentication_token_from_email

from app.models.user import User
from app.tests.utils.utils import random_lower_string
from app.tests.utils.author import create_random_author

def test_read_poems_as_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    
    poem = create_random_poem(db, is_public=True, show_author=False)
    create_random_poem(db, is_public=False)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 1
    
    for p in content["data"]:
        if p["id"] == str(poem.id):
            assert p["show_author"] == False
            assert p["authors_names"] == []
    
def test_read_poems_as_superuser(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_poem(db, is_public=False)
    create_random_poem(db, is_public=False)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2

def test_read_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_poem(db)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == poem.title
    assert content["content"] == poem.content
    assert content["is_public"] == poem.is_public
    assert content["show_author"] == poem.show_author
    assert content["id"] == str(poem.id)
    
def test_read_anonymous_poem(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    
    poem = create_random_poem(db, is_public=True, show_author=False)
    poem2 = create_random_translation(db, original_id=poem.id)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == poem.title
    assert content["content"] == poem.content
    assert content["is_public"] == poem.is_public
    assert content["show_author"] == poem.show_author
    assert content["id"] == str(poem.id)
    assert content["derived_poems"][0]["id"] == str(poem2.id)
    assert content["authors_names"] == []

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
    
def test_read_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_poem(db, is_public=False)
    response = client.get(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
    
def test_read_poems_me(
    client: TestClient, user_who_is_author: User, db: Session
) -> None: 
    token = authentication_token_from_email(client=client, db=db, email=user_who_is_author.email)
    create_random_poem(db, authors=[user_who_is_author.author])
    create_random_poem(db, authors=[user_who_is_author.author])
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/me",
        headers=token,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2

def test_read_poems_me_as_superuser(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None: 
    create_random_poem(db)
    create_random_poem(db)
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/me",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2

def test_create_poem(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": random_lower_string(), "content": random_lower_string()}
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
    
def test_create_derived_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_poem(db)
    data = {
        "title": random_lower_string(), 
        "content": random_lower_string(), 
        "original_poem_id": str(original.id), 
        "type": 0
    }
    response = client.post(
        f"{settings.API_V1_STR}/poems",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["original"]["id"] == str(original.id)
    
def test_update_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_poem(db)
    poem = create_random_poem(db)
    author = create_random_author(db)
    data = {
        "title": random_lower_string(), 
        "content": random_lower_string(),
        "author_ids": [str(author.id)],
        "original_poem_id": str(original.id),
        "type": 0
    }
    
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
    assert author.full_name in content["author_names"]
    assert content["original"]["id"] == str(original.id)
    assert content["type"] == 0

def test_update_poem_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": random_lower_string(), "content": random_lower_string()}
    response = client.put(
        f"{settings.API_V1_STR}/poems/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Poem not found"

def test_update_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_poem(db, is_public=False)
    data = {"title": random_lower_string(), "content": random_lower_string()}
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
    poem = create_random_poem(db)
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Poem deleted successfully"

def test_delete_poem_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Poem not found"

def test_delete_poem_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_poem(db)
    response = client.delete(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"