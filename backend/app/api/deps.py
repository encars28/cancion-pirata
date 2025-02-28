from collections.abc import Generator
from typing import Annotated, Callable, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.schemas.user import UserSchema
from app.crud.user import user_crud
from app.schemas.login import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token",
    auto_error=False
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

def get_current_user(required: bool) -> Callable[[SessionDep, TokenDep], Optional[UserSchema]]: 
    def _get_current_user(session: SessionDep, token: TokenDep) -> Optional[UserSchema]:
        if not required and not token:
            return None
        
        if required and not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
        except (InvalidTokenError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )

        user = user_crud.get_by_id(session, token_data.sub)  # type: ignore
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return user
    
    return _get_current_user


CurrentUser = Annotated[UserSchema, Depends(get_current_user(required=True))]
OptionalCurrentUser = Annotated[Optional[UserSchema], Depends(get_current_user(required=False))]


def get_current_active_superuser(current_user: CurrentUser) -> UserSchema:
    if not current_user or not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
