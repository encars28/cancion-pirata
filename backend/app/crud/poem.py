import uuid
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.poem import Poem, Poem_Poem
from app.models.author import Author

from app.schemas.poem import PoemCreate, PoemSchema, PoemUpdate
from app.schemas.poem_poem import PoemPoemCreate, PoemPoemUpdate, PoemPoemSchema

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
        
        author_names = []
        if "author_names" in obj_create_data.keys():
            author_names += obj_create_data["author_names"]
            del obj_create_data["author_names"]

        authors = db.scalars(select(Author).filter(Author.full_name.in_(author_names))).all()
        if len(authors) != len(author_names):
            return None
        
        type = None
        original_poem_id = None
        if "type" in obj_create_data.keys() and "original_poem_id" in obj_create_data.keys():
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

        db_obj.authors = authors # type: ignore
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
            authors = db.scalars(select(Author).filter(Author.full_name.in_(obj_update_data["author_names"]))).all()
            if len(authors) != len(obj_update_data["author_names"]):
                return None

            db_obj.authors = authors # type: ignore
            del obj_update_data["author_names"]

        statement = select(Poem_Poem).where(Poem_Poem.derived_poem_id == db_obj.id)
        db_poem_poem = db.scalars(statement).first()
        if not db_poem_poem and "type" in obj_update_data.keys() and "original_poem_id" in obj_update_data.keys():
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
