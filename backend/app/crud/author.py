from typing import Optional
import uuid
import datetime
import re

from app.models.author import Author
from app.models.poem import Poem
from app.schemas.author import (
    AuthorSchema,
    AuthorCreate,
    AuthorSearchParams,
    AuthorUpdate,
)

from sqlalchemy.orm import Session, aliased
from sqlalchemy import Select, select, func, desc


class AuthorCRUD:
    def get_by_id(
        self, db: Session, obj_id: Optional[uuid.UUID]
    ) -> Optional[AuthorSchema]:
        db_obj = db.get(Author, obj_id)
        return AuthorSchema.model_validate(db_obj) if db_obj else None

    def get_by_name(self, db: Session, name: str) -> Optional[AuthorSchema]:
        db_obj = db.scalars(select(Author).filter(Author.full_name == name)).first()
        return AuthorSchema.model_validate(db_obj) if db_obj else None

    def get_many(
        self, db: Session, queryParams: AuthorSearchParams, public_restricted: bool = True
    ) -> list[AuthorSchema]:
        birth_filter = self.filter_by_dates(queryParams)
        poem_filter = select(Author).where(
            Author.id.in_(self.filter_by_poem(db, queryParams, public_restricted))
        )
        name_filter = self.filter_by_name(queryParams)

        stmt = name_filter.intersect(poem_filter, birth_filter).subquery()
        alias = aliased(Author, stmt)

        if queryParams.order_by != "poems":
            if queryParams.desc:
                order = getattr(alias, queryParams.order_by).desc().nulls_last()
            else:
                order = getattr(alias, queryParams.order_by).nulls_first()

            db_objs = db.scalars(
                select(alias)
                .offset(queryParams.skip)
                .limit(queryParams.limit)
                .order_by(order)
            ).all()

        else:
            label = "poem_count"
            if queryParams.desc:
                order = desc(label)
            else:
                order = label

            db_objs = db.scalars(
                select(alias, func.count(Poem.id).label(label))
                .join(alias.poems)
                .group_by(alias)
                .offset(queryParams.skip)
                .limit(queryParams.limit)
                .order_by(order)
            ).all()

        return [AuthorSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session, queryParams: AuthorSearchParams, public_restricted: bool = True) -> int:
        birth_filter = self.filter_by_dates(queryParams)
        poem_filter = select(Author).where(
            Author.id.in_(self.filter_by_poem(db, queryParams, public_restricted))
        )
        name_filter = self.filter_by_name(queryParams)

        stmt = name_filter.intersect(poem_filter, birth_filter).subquery()
        alias = aliased(Author, stmt)
        
        statement = select(func.count()).select_from(alias)
        count = db.execute(statement).scalar()

        return count if count else 0

    def filter_by_poem(
        self, db: Session, query: AuthorSearchParams, public_restricted: bool = True
    ) -> list[uuid.UUID]:
        regex = r"(>|<|>=|<=|=|)(\d+)"
        m = re.match(regex, query.poems)

        if not m:
            return [a.id for a in db.scalars(select(Author)).all()]

        match m.group(1):
            case ">=":
                h = func.count(Poem.id) >= int(m.group(2))
            case "<=":
                h = func.count(Poem.id) <= int(m.group(2))
            case ">":
                h = func.count(Poem.id) > int(m.group(2))
            case "<":
                h = func.count(Poem.id) < int(m.group(2))
            case _:
                h = func.count(Poem.id) == int(m.group(2))

        s = (
            select(Author, func.count(Poem.id))
            .join(Author.poems)
            .group_by(Author.id)
            .having(h)
        )
        
        if public_restricted:
            s = s.where(Poem.is_public == True)

        return [a.id for a in db.scalars(s).all()]

    def filter_by_dates(self, query: AuthorSearchParams) -> Select:
        regex = r"(>|<|>=|<=|=|)(\d+)"
        m = re.match(regex, query.birth_date)

        if not m:
            return select(Author)

        match m.group(1):
            case ">=":
                s = select(Author).where(
                    Author.birth_date >= datetime.date(int(m.group(2)), 1, 1)
                )
            case ">":
                s = select(Author).where(
                    Author.birth_date >= datetime.date(int(m.group(2)) + 1, 1, 1)
                )
            case "<=":
                s = select(Author).where(
                    Author.birth_date <= datetime.date(int(m.group(2)), 12, 31)
                )
            case "<":
                s = select(Author).where(
                    Author.birth_date <= datetime.date(int(m.group(2)) - 1, 12, 31)
                )
            case _:
                s = select(Author).where(
                    Author.birth_date.between(
                        datetime.date(int(m.group(2)), 1, 1),
                        datetime.date(int(m.group(2)), 12, 31),
                    )
                )
        return s

    def filter_by_name(self, query: AuthorSearchParams) -> Select:
        return select(Author).where(Author.full_name.icontains(query.full_name))

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
