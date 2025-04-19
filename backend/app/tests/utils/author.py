from app.schemas.author import AuthorCreate, AuthorSchema
from app.crud.author import author_crud

from app.schemas.user import UserCreate, UserUpdate, UserSchema
from app.crud.user import user_crud
from app.core.config import settings

from app.tests.utils.utils import random_lower_string

from sqlalchemy.orm import Session


def create_random_author(db: Session) -> AuthorSchema:
    name = random_lower_string()
    author_in = AuthorCreate(full_name=name)

    author = author_crud.create(db=db, obj_create=author_in)
    return author


def get_user_author(db: Session) -> UserSchema:
    email = settings.EMAIL_TEST_AUTHOR_USER
    user = user_crud.get_by_email(db, email=email)

    if not user:
        user_in_create = UserCreate(
            email=email, password=random_lower_string(), username=random_lower_string()
        )
        user = user_crud.create(db=db, obj_create=user_in_create)

    if user.author_id is None:
        author = create_random_author(db)
        user_in_update = UserUpdate(author_id=author.id)
        user = user_crud.update(db=db, obj_id=user.id, obj_update=user_in_update)

    return user  # type: ignore


def get_author_user(db: Session) -> AuthorSchema:
    author_id = get_user_author(db).author_id
    return author_crud.get_by_id(db, author_id)  # type: ignore
