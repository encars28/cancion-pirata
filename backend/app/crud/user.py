import email
from typing import Optional
import uuid
import os

from app.core.security import verify_password, get_password_hash
from app.crud import author
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
from app.crud.author import author_crud


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
        self, db: Session, queryParams: UserSearchParams, public_restricted: bool = True
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
            
        statement = select(alias).offset(queryParams.user_skip).limit(queryParams.user_limit).order_by(order)
        if public_restricted:
            statement = statement.where(alias.is_verified == True)
            
        db_objs = db.scalars(
            statement
        ).all()

        return [UserSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session, queryParams: UserSearchParams, public_restricted: bool = True) -> int:
        username_filter = self.filter_by_text(
            db, queryParams.user_name, "username"
        )
        email_filter = self.filter_by_text(db, queryParams.user_email, "email")
        full_name_filter = self.filter_by_text(
            db, queryParams.user_full_name, "full_name"
        )
        
        if queryParams.user_skip_authors:
            author_filter = self.filter_no_authors(db)
            smt = username_filter.intersect(
                email_filter, full_name_filter, author_filter
            ).subquery()
        else:
            smt = username_filter.intersect(
                email_filter, full_name_filter
            ).subquery()
            
        alias = aliased(User, smt)
        
        statement = select(func.count()).select_from(alias)
        if public_restricted:
            statement = statement.where(alias.is_verified == True)
        count = db.execute(statement).scalar()
        return count if count else 0

    def filter_by_text(self, db: Session, query: str, attr: str) -> Select:
        return select(User).where(getattr(User, attr).icontains(query))
    
    def filter_no_authors(self, db: Session) -> Select:
        return select(User).where(User.author_id.is_(None))

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

        if db_obj.image_path and os.path.exists(db_obj.image_path):
            try:
                os.remove(db_obj.image_path)
            except: 
                pass
            
        if db_obj.author: 
            author_crud.delete(db, db_obj.author.id)
        
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
