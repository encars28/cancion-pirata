from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
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
def db() -> Generator[Session, None, None]:
    engine = create_engine(str(settings.SQLALCHEMY_TEST_DATABASE_URI))
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        init_db(session)
        yield session

    Base.metadata.drop_all(engine)


@pytest.fixture(scope="module")
def client(db: Session) -> Generator[TestClient, None, None]:
    def get_session_override():
        return db

    app.dependency_overrides[get_db] = get_session_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture(scope="module")
def user_who_is_author(db: Session) -> UserSchema:
    return get_author_user(db)
