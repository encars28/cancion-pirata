from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.config import settings

from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.user import user_crud
from app.crud.collection import collection_crud
from app.schemas.user import UserCreate
from app.schemas.author import AuthorCreate
from app.schemas.poem import PoemCreate
from app.schemas.collection import CollectionCreate
from app.tests.utils.author import create_random_author
from app.tests.utils.collection import create_random_collection
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_email, random_lower_string
from app.tests.utils.poem import create_random_poem

def test_search_as_admin(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    query = "test"
    
    user = user_crud.create(db, UserCreate(username="testuser", email=random_email(), password=random_lower_string()))
    user2 = create_random_user(db)
    
    author = author_crud.create(db, AuthorCreate(full_name="Test Author"))
    author2 = create_random_author(db)
    
    poem = poem_crud.create(db, PoemCreate(title="Test Poem", content="aaaa"))
    poem_private = poem_crud.create(db, PoemCreate(title="Private Test Poem", content="bbbb", is_public=False))
    poem2 = create_random_poem(db)
    
    collection = collection_crud.create(db, CollectionCreate(name="Test Collection", user_id=user.id))
    collection_private = collection_crud.create(db, CollectionCreate(name="Private Test Collection", user_id=user2.id, is_public=False))
    collection2 = create_random_collection(db, user.id)
    
    r = client.get(
        f"{settings.API_V1_STR}/search/",
        headers=superuser_token_headers,
        params={"q": query}
    )
    
    assert r.status_code == 200
    search_result = r.json()
    assert "authors" in search_result
    assert "users" in search_result
    assert "poems" in search_result
    assert "collections" in search_result
    
    assert search_result["authors"]["id"] == str(author.id)
    assert search_result["authors"]["full_name"] == author.full_name
    assert search_result["users"][0]["id"] == str(user.id)
    assert search_result["users"][0]["username"] == user.username
    
    assert len(search_result["poems"]) == 2
    assert len(search_result["collections"]) == 2
    
    
def test_search_as_normal_user(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    query = "test"
    
    user = user_crud.create(db, UserCreate(username="testuser", email=random_email(), password=random_lower_string()))
    user2 = create_random_user(db)
    
    author = author_crud.create(db, AuthorCreate(full_name="Test Author"))
    author2 = create_random_author(db)
    
    poem = poem_crud.create(db, PoemCreate(title="Test Poem", content="aaaa"))
    poem_private = poem_crud.create(db, PoemCreate(title="Private Test Poem", content="bbbb", is_public=False))
    poem2 = create_random_poem(db)
    
    collection = collection_crud.create(db, CollectionCreate(name="Test Collection", user_id=user.id))
    collection_private = collection_crud.create(db, CollectionCreate(name="Private Test Collection", user_id=user2.id, is_public=False))
    collection2 = create_random_collection(db, user.id)
    
    r = client.get(
        f"{settings.API_V1_STR}/search/",
        headers=normal_user_token_headers,
        params={"q": query}
    )
    
    assert r.status_code == 200
    search_result = r.json()
    
    assert search_result["authors"][0]["id"] == str(author.id)
    assert search_result["authors"][0]["full_name"] == author.full_name
    assert search_result["users"][0]["id"] == str(user.id)
    assert search_result["users"][0]["username"] == user.username
    
    assert len(search_result["poems"]) == 1
    assert search_result["poems"][0]["id"] == str(poem.id) # type: ignore
    assert search_result["poems"][0]["title"] == poem.title # type: ignore
    
    assert len(search_result["collections"]) == 1
    assert search_result["collections"][0]["id"] == str(collection.id)
    assert search_result["collections"][0]["name"] == collection.name
    