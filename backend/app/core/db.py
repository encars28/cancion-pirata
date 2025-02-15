from app.core.config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.crud.user import user_crud
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.base_class import Base


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def create_db_and_tables():
    Base.metadata.create_all(engine)
    
def init_db(session: Session):
    user = user_crud.get_one(session, User.email == settings.FIRST_SUPERUSER)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = user_crud.create(db=session, obj_create=user_in)