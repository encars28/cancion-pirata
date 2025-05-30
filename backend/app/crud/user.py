from typing import Optional
import uuid

from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserSchema,
    UserUpdate,
    UserUpdateMe,
)

from sqlalchemy.orm import Session
from sqlalchemy import select, func


class UserCRUD:
    def get_by_email(self, db: Session, email: str) -> Optional[UserSchema]:
        statement = select(User).where(User.email == email)
        db_obj = db.scalars(statement).first()

        return UserSchema.model_validate(db_obj) if db_obj else None

    def get_by_username(self, db: Session, username: str) -> Optional[UserSchema]:
        statement = select(User).where(User.username == username)
        db_obj = db.scalars(statement).first()

        return UserSchema.model_validate(db_obj) if db_obj else None

    def get_by_id(
        self, db: Session, obj_id: Optional[uuid.UUID]
    ) -> Optional[UserSchema]:
        db_obj = db.get(User, obj_id)
        return UserSchema.model_validate(db_obj) if db_obj else None

    def get_many(
        self, db: Session, query: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> list[UserSchema]:
        statement = select(User).offset(skip).limit(limit)
        if query:
            statement = statement.where(User.username.icontains(query))

        return [UserSchema.model_validate(db_obj) for db_obj in db.scalars(statement).all()]

    def get_count(self, db: Session) -> int:
        statement = select(func.count()).select_from(User)
        count = db.execute(statement).scalar()
        return count if count else 0

    def create(self, db: Session, obj_create: UserCreate) -> UserSchema:
        obj_data = obj_create.model_dump(exclude_none=True, exclude_unset=True)
        obj_data["hashed_password"] = get_password_hash(obj_create.password)

        db_schema = UserSchema.model_validate(obj_data)
        db_obj = User(**db_schema.model_dump(exclude_none=True, exclude_unset=True))

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return UserSchema.model_validate(db_obj)

    def update(
        self, db: Session, obj_id: uuid.UUID, obj_update: UserUpdate | UserUpdateMe
    ) -> Optional[UserSchema]:
        db_obj = db.get(User, obj_id)
        if not db_obj:
            return None

        user_data = obj_update.model_dump(exclude_unset=True)

        if "password" in user_data:
            user_data["hashed_password"] = get_password_hash(user_data["password"])
            del user_data["password"]

        for key, value in user_data.items():
            setattr(db_obj, key, value)

        db.commit()
        db.refresh(db_obj)

        return UserSchema.model_validate(db_obj)

    def delete(self, db: Session, obj_id: uuid.UUID) -> None:  # type: ignore
        db_obj = db.get(User, obj_id)
        if not db_obj:
            return None

        db.delete(db_obj)
        db.commit()

    def authenticate(
        self, db: Session, email: str, password: str
    ) -> Optional[UserSchema]:
        statement = select(User).where(User.email == email)
        db_user = db.scalars(statement).first()

        if not db_user:
            return None

        if not verify_password(password, db_user.hashed_password):
            return None

        return db_user


user_crud = UserCRUD()
