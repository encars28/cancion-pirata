from sqlmodel import SQLModel, create_engine, select
from app.core.config import settings

from app.models import User, UserCreate
from app.crud import crud_user

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def create_db_and_tables(session):
    SQLModel.metadata.create_all(engine)
    
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