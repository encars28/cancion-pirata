import uuid
from typing import Any
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.crud.user import user_crud
from app.api.deps import (
    CurrentUser,
    OptionalCurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import verify_password
from app.schemas.common import Message
from app.schemas.user import (
    UserCreate,
    UserPublic,
    UserRegister,
    UserSearchParams,
    UserUpdate,
    UserUpdateMe,
    UpdatePassword,
    UsersPublic,
)

from app.external.email import generate_new_account_email, send_email
from PIL import Image

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """
    params = UserSearchParams(user_skip=skip, user_limit=limit)
    count = user_crud.get_count(db=session, queryParams=params)
    users = [
        UserPublic.model_validate(user)
        for user in user_crud.get_many(db=session, queryParams=params)
    ]

    return UsersPublic(data=users, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = user_crud.get_by_email(session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = user_crud.get_by_username(session, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )

    user = user_crud.create(db=session, obj_create=user_in)
    # if settings.emails_enabled and user_in.email:
    #     email_data = generate_new_account_email(
    #         email_to=user_in.email, username=user_in.email, password=user_in.password
    #     )
    #     send_email(
    #         email_to=user_in.email,
    #         subject=email_data.subject,
    #         html_content=email_data.html_content,
    #     )
    return user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = user_crud.get_by_email(session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
            
    if user_in.username:
        existing_user = user_crud.get_by_username(session, username=user_in.username)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this username already exists"
            )
    
    current_user = user_crud.update(
        db=session, obj_id=current_user.id, obj_update=user_in
    ) # type: ignore
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    user_update = UserUpdate(password=body.new_password)
    current_user = user_crud.update(
        db=session, obj_id=current_user.id, obj_update=user_update
    )  # type: ignore
    return Message(message="Password updated successfully")

@router.post("/me/profile_picture", response_model=Message)
def update_user_profile_picture(
    session: SessionDep, image: UploadFile, current_user: CurrentUser
) -> Any:
    """
    Update own profile picture.
    """
    if not image.content_type or "image" not in image.content_type:
        raise HTTPException(
            status_code=400, detail="File is not an image"
        )
        
    if not current_user.image_path:
        path = os.path.join(settings.IMAGES_DIR, "users", str(current_user.id))
        try:
            os.makedirs(path, exist_ok=True)
        except OSError as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to create image directory for user: {e}"
            )
            
        user_crud.update_image_path(
            db=session, obj_id=current_user.id, image_path=path
        )
        
        with open(os.path.join(path, "profile.png"), "wb") as f:
            f.write(image.file.read())
            
        # resize_path = os.path.join(path, "profile_resize.png")
        # i = Image.open(os.path.join(path, "profile.png"))
        # i.thumbnail((400, 400))
        # i.save(resize_path)
    
        return Message(message="Profile picture updated successfully")

    with open(os.path.join(current_user.image_path, "profile.png"), "wb") as f:
        f.write(image.file.read())
        
    # resize_path = os.path.join(current_user.image_path, "profile_resize.png")
    # i = Image.open(os.path.join(current_user.image_path, "profile.png"))
    # i.thumbnail((400, 400))
    # i.save(resize_path)

    return Message(message="Profile picture updated successfully")

@router.get("/me/profile_picture")
def get_user_me_profile_picture(current_user: CurrentUser) -> Any:
    """
    Get own profile picture.
    """
    if not current_user.image_path:
        return None

    image_path = os.path.join(current_user.image_path, "profile.png")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Profile picture not found")

    return FileResponse(image_path)
    # resize_path = os.path.join(current_user.image_path, "profile_resize.png")
    # if not os.path.exists(resize_path):
    #     return FileResponse(image_path)
    
    # return FileResponse(resize_path)

@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )

    user_crud.delete(db=session, obj_id=current_user.id)
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = user_crud.get_by_email(session, user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
        
    user = user_crud.get_by_username(session, user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )

    user_data = user_in.model_dump(exclude_unset=True)
    user_create = UserCreate.model_validate(user_data)
    user_create.is_verified = False

    user = user_crud.create(db=session, obj_create=user_create)
    return user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: OptionalCurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = user_crud.get_by_id(session, user_id)
    if not user: 
        raise HTTPException(
            status_code=404, detail="The user with this id does not exist in the system"
        )
    if user == current_user or (current_user and current_user.is_superuser):
        return user
    
             
    user.collections = [collection for collection in user.collections if collection.is_public]
    return user

@router.get("/{user_id}/profile_picture")
def get_user_profile_picture(user_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Get profile picture.
    """
    user = user_crud.get_by_id(session, user_id)
    if not user: 
        raise HTTPException(
            status_code=404, detail="The user with this id does not exist in the system"
        )
        
    if not user.image_path:
        return None

    image_path = os.path.join(user.image_path, "profile.png")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Profile picture not found")

    return FileResponse(image_path)

@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = user_crud.get_by_id(session, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = user_crud.get_by_email(session, user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
            
    if user_in.username:
        existing_user = user_crud.get_by_username(session, user_in.username)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this username already exists"
            )

    db_user = user_crud.update(db=session, obj_id=db_user.id, obj_update=user_in)
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = user_crud.get_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )

    user_crud.delete(db=session, obj_id=user.id)
    return Message(message="User deleted successfully")