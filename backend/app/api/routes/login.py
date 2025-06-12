from datetime import timedelta
from typing import Annotated, Any
import uuid

from pydantic_core import PydanticCustomError
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import validate_email

from app.crud.user import user_crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.schemas.login import NewPassword, Token, VerifyToken
from app.schemas.user import UserPublic, UserUpdate
from app.schemas.common import Message
from app.utils import (
    generate_temporary_token,
    verify_password_reset_token,
    verify_account_token,
)

from app.external.email import generate_account_verification_email, generate_reset_password_email, send_email

router = APIRouter(tags=["login"])


@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user_email = form_data.username
    try: 
        validate_email(form_data.username)

    except PydanticCustomError:
        user = user_crud.get_by_username(session, form_data.username)
        if not user: 
            raise HTTPException(status_code=400, detail="Incorrect email or userame")
        
        user_email = user.email
        
    user = user_crud.authenticate(
        db=session, email=user_email, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_verified:
        raise HTTPException(status_code=400, detail="Not verified user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires, is_admin=user.is_superuser
        )
    )


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = user_crud.get_by_email(session, email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    password_reset_token = generate_temporary_token(sub=str(user.id), type="password_reset")
    email_data = generate_reset_password_email(
        email_to=user.email, username=user.username, token=password_reset_token
    )
    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Password recovery email sent")


@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    user_id = verify_password_reset_token(token=body.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    try:
        user = user_crud.get_by_id(session, uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user id")
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system.",
        )
    elif not user.is_verified:
        raise HTTPException(status_code=400, detail="Not verified user")

    user_update = UserUpdate(password=body.new_password)
    user = user_crud.update(db=session, obj_id=user.id, obj_update=user_update)

    return Message(message="Password updated successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Password Recovery
    """
    user = user_crud.get_by_email(session, email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_temporary_token(sub=str(user.id), type="password_reset")
    email_data = generate_reset_password_email(
        email_to=user.email, username=user.username, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )


@router.post("/activate-account/")
def activate_account(session: SessionDep, token: VerifyToken) -> Message:
    """
    Activate user account
    """
    user_id = verify_account_token(token=token.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    try:
        user = user_crud.get_by_id(session, uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user id")
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system.",
        )

    user_update = UserUpdate(is_verified=True)
    user = user_crud.update(db=session, obj_id=user.id, obj_update=user_update)

    return Message(message="Account verified successfully")