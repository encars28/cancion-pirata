import datetime
import uuid
import re
import random
from typing import Optional

from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func, Select
from app.models.poem import Poem, Poem_Poem
from app.models.author import Author, author_poem

from app.schemas.poem import (
    PoemCreate,
    PoemSchema,
    PoemSearchParams,
    PoemUpdate,
    PoemPoemCreate,
    PoemPoemUpdate,
    PoemPoemSchema,
    PoemType,
)


class PoemCRUD:
    def get_by_id(
        self, db: Session, obj_id: Optional[uuid.UUID]
    ) -> Optional[PoemSchema]:
        db_obj = db.get(Poem, obj_id)
        return PoemSchema.model_validate(db_obj) if db_obj else None

    def get_random(self, db: Session) -> Optional[PoemSchema]:
        poem_ids = db.scalars(select(Poem.id).where(Poem.is_public == True)).all()
        if poem_ids == []: 
            return None
        
        poem = random.choice(poem_ids)

        return self.get_by_id(db, poem)

    def get_many(
        self, db: Session, queryParams: PoemSearchParams, public_restricted: bool = True
    ) -> list[PoemSchema]:
        created_at_filter = self.filter_dates(queryParams.poem_created_at, "created_at")
        updated_at_filter = self.filter_dates(queryParams.poem_updated_at, "updated_at")
        title_filter = self.filter_by_title(queryParams)
        type_filter = self.filter_by_type(queryParams, db)
        language_filter = self.filter_by_language(queryParams)
        verses_filter = self.filter_by_num_verses(queryParams, db)
        author_filter = self.filter_by_author(db, queryParams.poem_author)

        stmt = title_filter.intersect(
            type_filter,
            created_at_filter,
            updated_at_filter,
            language_filter,
            verses_filter,
            author_filter,
        ).subquery()
        alias = aliased(Poem, stmt)

        if queryParams.poem_desc:
            order = getattr(alias, queryParams.poem_order_by).desc().nulls_last()
        else:
            order = getattr(alias, queryParams.poem_order_by).nulls_first()
        s = (
            select(alias)
            .offset(queryParams.poem_skip)
            .limit(queryParams.poem_limit)
            .order_by(order)
        )

        if public_restricted:
            s = s.where(alias.is_public == True)

        return [PoemSchema.model_validate(db_obj) for db_obj in db.scalars(s).all()]


    def get_count(
        self, db: Session, queryParams: PoemSearchParams, public_restricted: bool = True
    ) -> int:
        created_at_filter = self.filter_dates(queryParams.poem_created_at, "created_at")
        updated_at_filter = self.filter_dates(queryParams.poem_updated_at, "updated_at")
        title_filter = self.filter_by_title(queryParams)
        type_filter = self.filter_by_type(queryParams, db)
        language_filter = self.filter_by_language(queryParams)
        verses_filter = self.filter_by_num_verses(queryParams, db)
        author_filter = self.filter_by_author(db, queryParams.poem_author)

        stmt = title_filter.intersect(
            type_filter,
            created_at_filter,
            updated_at_filter,
            language_filter,
            verses_filter,
            author_filter,
        ).subquery()
        alias = aliased(Poem, stmt)

        statement = select(func.count()).select_from(alias)
        if public_restricted:
            statement = statement.where(alias.is_public == True)

        count = db.execute(statement).scalar()
        return count if count else 0

    def filter_by_language(self, query: PoemSearchParams) -> Select:
        return select(Poem).where(Poem.language.icontains(query.poem_language))

    def filter_dates(self, date: str, col: str) -> Select:
        regex = r"(>|<|>=|<=|=|)(\d+)"
        m = re.match(regex, date)

        if not m:
            return select(Poem)

        match m.group(1):
            case ">=":
                s = select(Poem).where(
                    getattr(Poem, col) >= datetime.date(int(m.group(2)), 1, 1)
                )
            case ">":
                s = select(Poem).where(
                    getattr(Poem, col) >= datetime.date(int(m.group(2)) + 1, 1, 1)
                )
            case "<=":
                s = select(Poem).where(
                    getattr(Poem, col) <= datetime.date(int(m.group(2)), 12, 31)
                )
            case "<":
                s = select(Author).where(
                    getattr(Poem, col) <= datetime.date(int(m.group(2)) - 1, 12, 31)
                )
            case _:
                s = select(Poem).where(
                    getattr(Poem, col).between(
                        datetime.date(int(m.group(2)), 1, 1),
                        datetime.date(int(m.group(2)), 12, 31),
                    )
                )
        return s

    def filter_by_title(self, query: PoemSearchParams) -> Select:
        return select(Poem).where(Poem.title.icontains(query.poem_title))

    def filter_by_num_verses(self, query: PoemSearchParams, db: Session) -> Select:
        regex = r"(>|<|>=|<=|=|)(\d+)"
        m = re.match(regex, query.poem_verses)

        if not m:
            return select(Poem)

        all_poems = db.scalars(select(Poem)).all()
        match m.group(1):
            case ">=":
                poems = [
                    poem.id
                    for poem in all_poems
                    if len(poem.content.split("\n")) >= int(m.group(2))
                ]
            case ">":
                poems = [
                    poem.id
                    for poem in all_poems
                    if len(poem.content.split("\n")) > int(m.group(2))
                ]
            case "<=":
                poems = [
                    poem.id
                    for poem in all_poems
                    if len(poem.content.split("\n")) <= int(m.group(2))
                ]
            case "<":
                poems = [
                    poem.id
                    for poem in all_poems
                    if len(poem.content.split("\n")) < int(m.group(2))
                ]
            case _:
                poems = [
                    poem.id
                    for poem in all_poems
                    if len(poem.content.split("\n")) == int(m.group(2))
                ]

        return select(Poem).where(Poem.id.in_(poems))

    def filter_by_type(self, query: PoemSearchParams, db: Session) -> Select:
        s = select(Poem).join(Poem_Poem, Poem.id == Poem_Poem.derived_poem_id)

        match query.poem_type:
            case "version":
                return s.where(Poem_Poem.type == PoemType.VERSION.value)
            case "translation":
                return s.where(Poem_Poem.type == PoemType.TRANSLATION.value)
            case "derived":
                return s
            case "original":
                poem_ids = [p.id for p in db.scalars(s).all()]
                return select(Poem).where(Poem.id.not_in(poem_ids))
            case _:
                return select(Poem)
            
    def filter_by_author(self, db:Session, author_name: str) -> Select:
        authors = db.scalars(
            select(Author).where(Author.full_name.icontains(author_name))
        ).all()
        if not authors:
            return select(Poem)
        
        author_ids = [author.id for author in authors]
        return select(Poem).join(author_poem, Poem.id == author_poem.c.poem_id).where(author_poem.c.author_id.in_(author_ids))


    def create(self, db: Session, obj_create: PoemCreate) -> Optional[PoemSchema]:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        author_names = []
        if "author_names" in obj_create_data.keys():
            author_names += obj_create_data["author_names"]
            del obj_create_data["author_names"]

        authors = db.scalars(
            select(Author).filter(Author.full_name.in_(author_names))
        ).all()
        if len(authors) != len(author_names):
            return None

        type = None
        original_poem_id = None
        if (
            "type" in obj_create_data.keys()
            and "original_poem_id" in obj_create_data.keys()
        ):
            type = obj_create_data["type"]
            original_poem_id = obj_create_data["original_poem_id"]

        if "type" in obj_create_data.keys():
            del obj_create_data["type"]

        if "original_poem_id" in obj_create_data.keys():
            del obj_create_data["original_poem_id"]

        obj = PoemSchema.model_validate(obj_create_data)
        db_obj = Poem(**obj.model_dump(exclude_unset=True))

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        db_obj.authors = authors  # type: ignore
        db.commit()
        db.refresh(db_obj)

        if type is not None and original_poem_id:
            poem_poem_create = PoemPoemCreate(
                original_poem_id=original_poem_id,
                derived_poem_id=db_obj.id,
                type=type,
            )

            poem_poem = PoemPoemSchema.model_validate(poem_poem_create)
            db_poem_poem = Poem_Poem(**poem_poem.model_dump(exclude_unset=True))
            db.add(db_poem_poem)
            db.commit()

        return PoemSchema.model_validate(db_obj)

    def update(
        self,
        db: Session,
        obj_id: uuid.UUID,
        obj_update: PoemUpdate,
    ) -> Optional[PoemSchema]:
        db_obj = db.get(Poem, obj_id)
        if not db_obj:
            return None

        obj_update_data = obj_update.model_dump(exclude_unset=True)

        if "author_names" in obj_update_data.keys():
            authors = db.scalars(
                select(Author).filter(
                    Author.full_name.in_(obj_update_data["author_names"])
                )
            ).all()
            if len(authors) != len(obj_update_data["author_names"]):
                return None

            db_obj.authors = authors  # type: ignore
            del obj_update_data["author_names"]

        statement = select(Poem_Poem).where(Poem_Poem.derived_poem_id == db_obj.id)
        db_poem_poem = db.scalars(statement).first()
        if (
            not db_poem_poem
            and "type" in obj_update_data.keys()
            and "original_poem_id" in obj_update_data.keys()
        ):
            poem_poem_in = PoemPoemCreate(
                type=obj_update_data["type"],
                original_poem_id=obj_update_data["original_poem_id"],
                derived_poem_id=db_obj.id,
            )

            poem_poem = PoemPoemSchema.model_validate(poem_poem_in)
            db_poem_poem = Poem_Poem(**poem_poem.model_dump(exclude_unset=True))
            db.add(db_poem_poem)
            db.commit()

        elif db_poem_poem:
            poem_poem_in = PoemPoemUpdate()
            if "type" in obj_update_data.keys():
                poem_poem_in.type = obj_update_data["type"]
                del obj_update_data["type"]

            if "original_poem_id" in obj_update_data.keys():
                poem_poem_in.original_poem_id = obj_update_data["original_poem_id"]
                del obj_update_data["original_poem_id"]

            poem_poem_update_data = poem_poem_in.model_dump(exclude_unset=True)

            for field, value in poem_poem_update_data.items():
                setattr(db_poem_poem, field, value)

            db.commit()

        for field, value in obj_update_data.items():
            setattr(db_obj, field, value)

        db.commit()
        db.refresh(db_obj)

        return PoemSchema.model_validate(db_obj)

    def delete(self, db: Session, obj_id: uuid.UUID) -> None:
        db_obj = db.get(Poem, obj_id)
        if not db_obj:
            return None

        if db_obj.derived_poems:
            for poem in db_obj.derived_poems:
                db.delete(poem)

        db.delete(db_obj)
        db.commit()


poem_crud = PoemCRUD()
