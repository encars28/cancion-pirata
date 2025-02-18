from typing import Optional
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud.user import user_crud
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.tests.utils.utils import random_email, random_lower_string
from app.tests.utils.author import create_random_author


def user_authentication_headers(
    *, client: TestClient, email: str, password: str
) -> dict[str, str]:
    data = {"username": email, "password": password}

    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def create_random_user(db: Session, full_name: Optional[str] = None) -> User:
    email = random_email()
    password = random_lower_string()
    
    if full_name: 
        user_in = UserCreate(email=email, password=password, full_name=full_name)
    else:
        user_in = UserCreate(email=email, password=password)
    user = user_crud.create(db=db, obj_create=user_in)
    return user

def get_author_user(db: Session) -> User:
    email = settings.EMAIL_TEST_AUTHOR_USER
    user = user_crud.get_one(db, User.email == email)
    
    if not user:
        user_in_create = UserCreate(email=email, password=random_lower_string())
        user = user_crud.create(db=db, obj_create=user_in_create)
        
    if user.author_id is None:
        author = create_random_author(db)
        user_in_update = UserUpdate(author_id=author.id)
        user = user_crud.update(db=db, db_obj=user, obj_update=user_in_update)
        
    return user
        
def authentication_token_from_email(
    *, client: TestClient, email: str, db: Session
) -> dict[str, str]:
    """
    Return a valid token for the user with given email.

    If the user doesn't exist it is created first.
    """
    password = random_lower_string()
    user = user_crud.get_one(db, User.email == email)
    if not user:
        user_in_create = UserCreate(email=email, password=password)
        user = user_crud.create(db=db, obj_create=user_in_create)
    else:
        user_in_update = UserUpdate(password=password)
        if not user.id:
            raise Exception("User id not set")
        user = user_crud.update(db=db, db_obj=user, obj_update=user_in_update)

    return user_authentication_headers(client=client, email=email, password=password)

def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers