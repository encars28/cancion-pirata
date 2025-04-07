import uuid
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.poem import Poem
from app.models.author import Author

from app.schemas.poem import PoemCreate, PoemSchema, PoemUpdate


class PoemCRUD:
    def get_by_id(
        self, db: Session, obj_id: Optional[uuid.UUID]
    ) -> Optional[PoemSchema]:
        db_obj = db.get(Poem, obj_id)
        return PoemSchema.model_validate(db_obj) if db_obj else None

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> list[PoemSchema]:
        db_objs = db.scalars(select(Poem).offset(skip).limit(limit)).all()
        return [PoemSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_all_public(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> list[PoemSchema]:
        db_objs = db.scalars(
            select(Poem).where(Poem.is_public).offset(skip).limit(limit)
        ).all()
        return [PoemSchema.model_validate(db_obj) for db_obj in db_objs]

    def get_count(self, db: Session) -> int:
        statement = select(func.count()).select_from(Poem)
        count = db.execute(statement).scalar()
        return count if count else 0

    def get_public_count(self, db: Session) -> int:
        statement = select(func.count()).select_from(Poem).where(Poem.is_public)
        count = db.execute(statement).scalar()
        return count if count else 0

    def create(self, db: Session, obj_create: PoemCreate) -> Optional[PoemSchema]:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        author_ids = []
        if "author_ids" in obj_create_data.keys():
            author_ids += obj_create_data["author_ids"]
            del obj_create_data["author_ids"]

        authors = [db.get(Author, author_id) for author_id in author_ids]
        if None in authors:
            return None

        obj = PoemSchema.model_validate(obj_create_data)
        obj_data = obj.model_dump(exclude_unset=True)

        db_obj = Poem(**obj_data)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        db_obj.authors += authors
        db.commit()
        db.refresh(db_obj)

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

        if "author_ids" in obj_update_data.keys():
            authors = [
                db.get(Author, author_id) for author_id in obj_update_data["author_ids"]
            ]
            if None in authors:
                return None

            db_obj.authors = authors
            del obj_update_data["author_ids"]

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
