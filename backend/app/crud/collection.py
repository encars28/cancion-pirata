from typing import Optional
import uuid

from app.models.collection import Collection

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.poem import Poem
from app.schemas.collection import CollectionCreate, CollectionSchema, CollectionUpdate


class CollectionCRUD:
    def get_by_id(self, db: Session, obj_id: uuid.UUID) -> Optional[CollectionSchema]:
        db_obj = db.get(Collection, obj_id)
        if not db_obj:
            return None

        return CollectionSchema.model_validate(db_obj)
    
    def get_many(self, db: Session, query: Optional[str] = None, skip: int = 0, limit: int = 100, public_restricted: bool = True) -> list[CollectionSchema]:
        statement = select(Collection).offset(skip).limit(limit)
        if query:
            statement = statement.where(Collection.name.icontains(query))
            
        if public_restricted:
            statement = statement.where(Collection.is_public == True)

        return [CollectionSchema.model_validate(db_obj) for db_obj in db.scalars(statement).all()]
    
    def create(self, db: Session, obj_create: CollectionCreate) -> Optional[CollectionSchema]:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        poem_ids = []
        if "poem_ids" in obj_create_data.keys():
            poem_ids += obj_create_data["poem_ids"]
            del obj_create_data["poem_ids"]

        poems = db.scalars(
            select(Poem).filter(Poem.id.in_(poem_ids))
        ).all()
        if len(poems) != len(poem_ids):
            return None
        
        obj = CollectionSchema.model_validate(obj_create_data)
        db_obj = Collection(**obj.model_dump(exclude_unset=True))
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        db_obj.poems = poems # type: ignore
        db.commit()

        return CollectionSchema.model_validate(db_obj)

    def update(
        self,
        db: Session,
        obj_id: uuid.UUID,
        obj_update: CollectionUpdate,
    ) -> Optional[CollectionSchema]:
        db_obj = db.get(Collection, obj_id)
        if not db_obj:
            return None

        obj_update_data = obj_update.model_dump(exclude_unset=True)
        
        if "poem_ids" in obj_update_data.keys():
            poems = db.scalars(
                select(Poem).filter(Poem.id.in_(obj_update_data["poem_ids"]))
            ).all()
            if len(poems) != len(obj_update_data["poem_ids"]):
                return None
            
            db_obj.poems = poems # type: ignore
            del obj_update_data["poem_ids"]
        
        for field, value in obj_update_data.items():
            setattr(db_obj, field, value)

        db.commit()
        db.refresh(db_obj)

        return CollectionSchema.model_validate(db_obj)

    def delete(self, db: Session, obj_id: uuid.UUID) -> None:
        db_obj = db.get(Collection, obj_id)
        if not db_obj:
            return None

        db.delete(db_obj)
        db.commit()


collection_crud = CollectionCRUD()
