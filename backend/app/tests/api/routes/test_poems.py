import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.poem import create_random_poem, create_random_derived_poem
from app.tests.utils.user import authentication_token_from_email

from app.models.user import User
from app.tests.utils.utils import random_lower_string
from app.tests.utils.author import create_random_author
from app.tests.utils.user import create_random_user
from app.schemas.poem import PoemType

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
            assert p["author_names"] == []
    
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
    poem2 = create_random_derived_poem(db, original_id=poem.id)
    
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
    assert content["author_names"] == []

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
    create_random_poem(db, authors=[user_who_is_author.author]) # type: ignore
    create_random_poem(db, authors=[user_who_is_author.author]) # type: ignore
    
    response = client.get(
        f"{settings.API_V1_STR}/poems/me",
        headers=token,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2

def test_read_poems_me_no_poems(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None: 
    response = client.get(
        f"{settings.API_V1_STR}/poems/me",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) == 0

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

def test_create_poem_as_superuser(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    author = create_random_author(db)
    data = {
        "title": random_lower_string(), 
        "content": random_lower_string(),
        "author_ids": [str(author.id)]
    }
    
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
    assert author.full_name in content["author_names"]

def test_create_poem_as_superuser_no_authors(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": random_lower_string(), "content": random_lower_string(), "author_ids": [str(uuid.uuid4())]}
    response = client.post(
        f"{settings.API_V1_STR}/poems/",
        headers=superuser_token_headers,
        json=data,
    )
    
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Author not found"

def test_create_poem_as_normal_user(
    client: TestClient, user_who_is_author: User, db: Session
) -> None:
    token = authentication_token_from_email(client=client, db=db, email=user_who_is_author.email)
    data = {"title": random_lower_string(), "content": random_lower_string()}
    response = client.post(
        f"{settings.API_V1_STR}/poems/",
        headers=token,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["author_names"][0] == user_who_is_author.author.full_name # type: ignore

def test_create_poem_for_the_first_time_with_name(
    client: TestClient, db: Session
) -> None:
    
    user = create_random_user(db, full_name="pedro")
    token = authentication_token_from_email(client=client, db=db, email=user.email)
    
    data = {"title": random_lower_string(), "content": random_lower_string()}
    response = client.post(
        f"{settings.API_V1_STR}/poems/",
        headers=token,
        json=data,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["author_names"][0] == user.full_name
    
def test_create_poem_for_the_first_time_without_name(
    client: TestClient, db: Session
) -> None:
    
    user = create_random_user(db)
    token = authentication_token_from_email(client=client, db=db, email=user.email)
    
    data = {"title": random_lower_string(), "content": random_lower_string()}
    response = client.post(
        f"{settings.API_V1_STR}/poems/",
        headers=token,
        json=data,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert "id" in content
    assert content["author_names"][0] == user.email

def test_create_derived_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_poem(db)
    data = {
        "title": random_lower_string(), 
        "content": random_lower_string(), 
        "original_poem_id": str(original.id), 
        "type": PoemType.TRANSLATION.value
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
    assert content["type"] == PoemType.TRANSLATION.value
    
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
        "type": PoemType.TRANSLATION.value
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
    assert content["type"] == PoemType.TRANSLATION.value

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

def test_update_poem_no_authors(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    poem = create_random_poem(db)
    data = {"title": random_lower_string(), "content": random_lower_string(), "author_ids": [str(uuid.uuid4())]}
    response = client.put(
        f"{settings.API_V1_STR}/poems/{poem.id}",
        headers=superuser_token_headers,
        json=data,
    )
    
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Author not found"

def test_update_derived_poem(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    original = create_random_poem(db)
    new_original = create_random_poem(db)
    poem = create_random_derived_poem(db, original_id=original.id)
    data = {
        "title": random_lower_string(), 
        "content": random_lower_string(), 
        "type": PoemType.VERSION.value,
        "original_poem_id": str(new_original.id)
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
    assert content["original"]["id"] == str(new_original.id)
    assert content["type"] == PoemType.VERSION.value

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