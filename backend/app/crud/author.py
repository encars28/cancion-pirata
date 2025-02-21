from typing import Optional
import uuid

from app.models.author import Author
from app.schemas.author import AuthorSchema, AuthorCreate, AuthorUpdate

from sqlalchemy.orm import Session
from sqlalchemy import select, func


class AuthorCRUD:
    def get_by_id(
        self, db: Session, obj_id: Optional[uuid.UUID]
    ) -> Optional[AuthorSchema]:
        db_obj = db.get(Author, obj_id)
        return AuthorSchema.model_validate(db_obj) if db_obj else None

    def get_by_name(self, db: Session, name: str) -> Optional[AuthorSchema]:
        db_obj = db.scalars(select(Author).filter(Author.full_name == name)).first()
        return AuthorSchema.model_validate(db_obj) if db_obj else None

    def get_all(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> list[AuthorSchema]:
        db_objs = db.scalars(select(Author).offset(skip).limit(limit)).all()
        return [AuthorSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session) -> int:
        statement = select(func.count()).select_from(Author)
        count = db.execute(statement).scalar()
        return count if count else 0

    def create(self, db: Session, obj_create: AuthorCreate) -> AuthorSchema:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        obj = AuthorSchema.model_validate(obj_create_data)
        obj_data = obj.model_dump(exclude_unset=True)

        db_obj = Author(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return AuthorSchema.model_validate(db_obj)

    def update(
        self,
        db: Session,
        obj_id: uuid.UUID,
        obj_update: AuthorUpdate,
    ) -> Optional[AuthorSchema]:
        db_obj = db.get(Author, obj_id)
        if not db_obj:
            return None

        obj_update_data = obj_update.model_dump(exclude_unset=True)
        for field, value in obj_update_data.items():
            setattr(db_obj, field, value)

        db.commit()
        db.refresh(db_obj)

        return AuthorSchema.model_validate(db_obj)

    def delete(self, db: Session, obj_id: uuid.UUID) -> None:
        db_obj = db.get(Author, obj_id)
        if not db_obj:
            return None

        # TODO: See if I can get this to work with cascades
        for poem in db_obj.poems:
            db.delete(poem)

        db.delete(db_obj)
        db.commit()


author_crud = AuthorCRUD()
