import email
from typing import Optional
import uuid
import os

from yaml import AliasEvent

from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.models import user
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserSchema,
    UserSearchParams,
    UserUpdate,
    UserUpdateMe,
)

from sqlalchemy.orm import Session, aliased
from sqlalchemy import Select, select, func


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
        self, db: Session, queryParams: UserSearchParams
    ) -> list[UserSchema]:
        username_filter = self.filter_by_text(
            db, queryParams.user_name, "username"
        )
        email_filter = self.filter_by_text(db, queryParams.user_email, "email")
        full_name_filter = self.filter_by_text(
            db, queryParams.user_full_name, "full_name"
        )
        
        smt = username_filter.intersect(
            email_filter, full_name_filter
        ).subquery()
        alias = aliased(User, smt)
        
        if queryParams.user_desc:
            order = getattr(alias, queryParams.user_order_by).desc().nulls_last()
        else: 
            order = getattr(alias, queryParams.user_order_by).nulls_first()
            
        db_objs = db.scalars(
            select(alias)
            .offset(queryParams.user_skip)
            .limit(queryParams.user_limit)
            .order_by(order)
        ).all()

        return [UserSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session, queryParams: UserSearchParams) -> int:
        username_filter = self.filter_by_text(
            db, queryParams.user_name, "username"
        )
        email_filter = self.filter_by_text(db, queryParams.user_email, "email")
        full_name_filter = self.filter_by_text(
            db, queryParams.user_full_name, "full_name"
        )
        
        smt = username_filter.intersect(
            email_filter, full_name_filter
        ).subquery()
        alias = aliased(User, smt)
        
        statement = select(func.count()).select_from(alias)
        count = db.execute(statement).scalar()
        return count if count else 0

    def filter_by_text(self, db: Session, query: str, attr: str) -> Select:
        return select(User).where(getattr(User, attr).icontains(query))

    def create(self, db: Session, obj_create: UserCreate) -> UserSchema:
        obj_data = obj_create.model_dump(exclude_none=True, exclude_unset=True)
        obj_data["hashed_password"] = get_password_hash(obj_create.password)

        db_schema = UserSchema.model_validate(obj_data)
        db_obj = User(**db_schema.model_dump(exclude_none=True, exclude_unset=True))

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return UserSchema.model_validate(db_obj)

    def update_image_path(
        self, db: Session, obj_id: uuid.UUID, image_path: str
    ) -> Optional[UserSchema]:
        db_obj = db.get(User, obj_id)
        if not db_obj:
            return None

        # Ensure the image path is valid and exists
        if not os.path.exists(image_path):
            return None

        # Update the image path
        db_obj.image_path = image_path

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
        
        # Update author full_name if it exists
        if "full_name" in user_data and db_obj.author is not None:
            db_obj.author.full_name = user_data["full_name"]
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
