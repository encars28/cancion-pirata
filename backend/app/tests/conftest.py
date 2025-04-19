from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.base_class import Base
from app.core.db import init_db
from app.main import app
from app.api.deps import get_db
from app.tests.utils.user import (
    authentication_token_from_email,
    get_author_user,
    get_superuser_token_headers,
)

from app.schemas.user import UserSchema


@pytest.fixture(scope="session", autouse=True)
def db_engine() -> Generator[Engine, None, None]:
    engine = create_engine(str(settings.SQLALCHEMY_TEST_DATABASE_URI))
        
    Base.metadata.create_all(engine)
    
    with Session(engine) as session:
        init_db(session)

    yield engine
    
    Base.metadata.drop_all(engine)
    
@pytest.fixture()
def db(db_engine: Session) -> Generator[Session, None, None]:    
    with db_engine.connect() as connection: # type: ignore
        connection.begin()
        db_session = Session(connection)
        
        yield db_session
        
        db_session.rollback()
    
@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:

    app.dependency_overrides[get_db] = lambda: db

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


@pytest.fixture()
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture()
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture(scope="function")
def user_who_is_author(db: Session) -> UserSchema:
    return get_author_user(db)
