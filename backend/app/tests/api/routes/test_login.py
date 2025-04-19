from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password
from app.crud.user import user_crud
from app.utils import generate_password_reset_token
from app.schemas.user import UserUpdate, UserCreate

from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_email, random_lower_string


def test_get_access_token(client: TestClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]
    
def test_get_access_token_with_username(client: TestClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER_NAME,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]
    
def test_get_access_token_incorrect_username(client: TestClient) -> None:
    login_data = {
        "username": "incorrect",
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Incorrect email or userame"}


def test_get_access_token_incorrect_password(client: TestClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": "incorrect",
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400


def test_get_access_token_inactive_user(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()
    user_create = UserCreate(
        email=email, password=password, is_active=False, username=username
    )
    user_crud.create(db, obj_create=user_create)

    login_data = {
        "username": email,
        "password": password,
    }

    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Inactive user"}


def test_use_access_token(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/login/test-token",
        headers=superuser_token_headers,
    )
    result = r.json()
    assert r.status_code == 200
    assert "email" in result


def test_recovery_password(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    with (
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        email = "test@example.com"
        r = client.post(
            f"{settings.API_V1_STR}/password-recovery/{email}",
            headers=normal_user_token_headers,
        )
        assert r.status_code == 200
        assert r.json() == {"message": "Password recovery email sent"}


def test_recovery_password_user_not_exits(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = "jVgQr@example.com"
    r = client.post(
        f"{settings.API_V1_STR}/password-recovery/{email}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 404


def test_reset_password(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    token = generate_password_reset_token(email=settings.FIRST_SUPERUSER)
    data = {"new_password": "changethis", "token": token}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    assert r.json() == {"message": "Password updated successfully"}

    user = user_crud.get_by_email(db, email=settings.FIRST_SUPERUSER)
    assert user
    assert verify_password(data["new_password"], user.hashed_password)

    token = generate_password_reset_token(email=settings.FIRST_SUPERUSER)
    data = {"new_password": settings.FIRST_SUPERUSER_PASSWORD, "token": token}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )

    assert r.status_code == 200


def test_reset_password_invalid_token(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"new_password": "changethis", "token": "invalid"}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 400
    assert response["detail"] == "Invalid token"


def test_reset_password_no_user(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    token = generate_password_reset_token(email=random_email())
    data = {"new_password": "changethis", "token": token}

    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )

    assert r.status_code == 404
    assert r.json() == {
        "detail": "The user with this email does not exist in the system."
    }


def test_reset_password_user_not_active(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    user = create_random_user(db)
    user_in = UserUpdate(is_active=False)
    user = user_crud.update(db=db, obj_id=user.id, obj_update=user_in)

    token = generate_password_reset_token(email=user.email)  # type: ignore
    data = {"new_password": "changethis", "token": token}

    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )

    assert r.status_code == 400
    assert r.json() == {"detail": "Inactive user"}


def test_password_recovery_html_content_invalid_user(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/password-recovery-html-content/{random_email()}",
        headers=superuser_token_headers,
    )

    assert r.status_code == 404
    assert r.json() == {
        "detail": "The user with this username does not exist in the system."
    }


def test_password_recovery_html_content(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/password-recovery-html-content/{settings.FIRST_SUPERUSER}",
        headers=superuser_token_headers,
    )

    assert r.status_code == 200
    assert r.headers["subject:"]
