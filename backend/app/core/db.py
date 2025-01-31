from sqlmodel import SQLModel, create_engine, select
from app.core.config import settings

from app.models import User, UserCreate
from app.crud import crud_user

from sqlmodel import Session

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def init_db(session: Session):
    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud_user.create_user(session=session, user_create=user_in)