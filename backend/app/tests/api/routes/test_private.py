from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.crud.user import user_crud


def test_create_user(client: TestClient, db: Session) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/private/users/",
        json={
            "email": "pollo@listo.com",
            "password": "password123",
            "full_name": "Pollo Listo",
            "username": "pollo",
        },
    )

    assert r.status_code == 200

    data = r.json()
    user_id = data["id"]

    user = user_crud.get(db, user_id)

    assert user
    assert user.email == "pollo@listo.com"
    assert user.full_name == "Pollo Listo"