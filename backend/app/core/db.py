from app.core.config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.crud.user import user_crud
from app.schemas.user import UserCreate
from app.core.base_class import Base

import app.models.user
import app.models.author
import app.models.poem
import app.models.collection

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def create_db_and_tables():
    Base.metadata.create_all(engine)


def init_db(session: Session):
    user = user_crud.get_by_email(db=session, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            username=settings.FIRST_SUPERUSER_NAME,
            is_superuser=True,
        )
        user = user_crud.create(db=session, obj_create=user_in)
