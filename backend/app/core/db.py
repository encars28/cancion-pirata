from app.core.config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
Base = declarative_base()

def create_db_and_tables():
    Base.metadata.create_all(engine)