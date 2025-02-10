from app.core.config import settings

from app.models import User, UserCreate
from backend.app.crud import user

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, declarative_base

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), echo=True)
Base = declarative_base()

def create_db_and_tables():
    Base.metadata.create_all(engine)

# def init_db(session: Session):
#     user = session.execute(
#         select(User).where(User.email == settings.FIRST_SUPERUSER)
#     ).first()
#     if not user:
#         user_in = UserCreate(
#             email=settings.FIRST_SUPERUSER,
#             password=settings.FIRST_SUPERUSER_PASSWORD,
#             is_superuser=True,
#         )
#         user = crud_user.create_user(session=session, user_create=user_in)