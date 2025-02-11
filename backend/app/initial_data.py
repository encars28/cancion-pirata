import logging

from sqlalchemy.orm import Session

from app.core.db import engine, create_db_and_tables
from app.crud.user import user_crud
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(session: Session):
    user = user_crud.get_one(session, User.email == settings.FIRST_SUPERUSER)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = user_crud.create(db=session, obj_create=user_in)

def init() -> None:
    with Session(engine) as session:
        create_db_and_tables()
        init_db(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()