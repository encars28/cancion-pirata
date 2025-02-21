from typing import Any

from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.user import UserPublic, PrivateUserCreate
from app.crud.user import user_crud

router = APIRouter(tags=["private"], prefix="/private")


@router.post("/users/", response_model=UserPublic)
def create_user(user_in: PrivateUserCreate, session: SessionDep) -> Any:
    """
    Create a new user.
    """
    return user_crud.create(session, obj_create=user_in)
