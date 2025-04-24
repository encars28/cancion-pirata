from typing import Optional
import uuid
import datetime

from app.models.author import Author
from app.models.poem import Poem
from app.schemas.author import (
    AuthorFilterParams,
    AuthorSchema,
    AuthorCreate,
    AuthorSearchParams,
    AuthorUpdate,
)

from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc


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
        self, db: Session, queryParams: AuthorFilterParams
    ) -> list[AuthorSchema]:
        if queryParams.order_by != "poems":
            if queryParams.desc:
                db_objs = db.scalars(
                    select(Author)
                    .offset(queryParams.skip)
                    .limit(queryParams.limit)
                    .order_by(getattr(Author, queryParams.order_by).desc())
                ).all()
            else:
                db_objs = db.scalars(
                    select(Author)
                    .offset(queryParams.skip)
                    .limit(queryParams.limit)
                    .order_by(getattr(Author, queryParams.order_by))
                ).all()
        else:
            if queryParams.desc:
                db_objs = db.scalars(
                    select(Author, func.count(Poem.id).label("poem_count"))
                    .join(Author.poems)
                    .group_by(Author.id)
                    .offset(queryParams.skip)
                    .limit(queryParams.limit)
                    .order_by(desc("poem_count"))   
                ).all()
            else:
                db_objs = db.scalars(
                    select(Author, func.count(Poem.id).label("poem_count"))
                    .join(Author.poems)
                    .group_by(Author.id)
                    .offset(queryParams.skip)
                    .limit(queryParams.limit)
                    .order_by("poem_count")
                ).all()

        return [AuthorSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session) -> int:
        statement = select(func.count()).select_from(Author)
        count = db.execute(statement).scalar()
        return count if count else 0

    def search_date_column(
        self, db: Session, query: AuthorSearchParams
    ) -> list[AuthorSchema]:
        if not query.query.isnumeric():
            return []

        db_objs = db.scalars(
            select(Author).where(
                getattr(Author, query.col).between(
                    datetime.date(int(query.query), 1, 1),
                    datetime.date(int(query.query), 12, 31),
                )
            )
        ).all()

        return [AuthorSchema.model_validate(db_obj) for db_obj in db_objs]

    def search_text_column(
        self, db: Session, query: AuthorSearchParams
    ) -> list[AuthorSchema]:
        db_objs = db.scalars(
            select(Author).where(getattr(Author, query.col).icontains(query.query))
        ).all()

        return [AuthorSchema.model_validate(db_obj) for db_obj in db_objs]

    def create(self, db: Session, obj_create: AuthorCreate) -> AuthorSchema:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        obj = AuthorSchema.model_validate(obj_create_data)
        db_obj = Author(**obj.model_dump(exclude_unset=True))
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
