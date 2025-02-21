from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.poem import Poem_Poem
from app.schemas.poem_poem import PoemPoemCreate, PoemPoemSchema, PoemPoemUpdate

import uuid
from typing import Optional


class PoemPoemCRUD:
    def get_by_derived_id(self, db: Session, derived_id: uuid.UUID) -> Optional[PoemPoemSchema]:
        statement = select(Poem_Poem).where(Poem_Poem.derived_poem_id == derived_id)
        db_obj = db.scalars(statement).first()
        
        if not db_obj:
            return None
        
        return PoemPoemSchema.model_validate(db_obj)
        
    def create(self, db: Session, obj_create: PoemPoemCreate) -> PoemPoemSchema:
        obj_create_data = obj_create.model_dump(exclude_unset=True)

        obj = PoemPoemSchema.model_validate(obj_create_data)
        obj_data = obj.model_dump(exclude_unset=True)

        db_obj = Poem_Poem(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return PoemPoemSchema.model_validate(db_obj)

    def update(
        self,
        db: Session,
        original_id: uuid.UUID,
        derived_id: uuid.UUID,
        obj_update: PoemPoemUpdate,
    ) -> Optional[PoemPoemSchema]:
        statement = select(Poem_Poem).where(
            Poem_Poem.original_poem_id == original_id, Poem_Poem.derived_poem_id == derived_id
        )
        db_obj = db.scalars(statement).first()

        if not db_obj:
            return None

        obj_update_data = obj_update.model_dump(exclude_unset=True)

        for field, value in obj_update_data.items():
            setattr(db_obj, field, value)

        db.commit()
        db.refresh(db_obj)

        return PoemPoemSchema.model_validate(db_obj)


poem_poem_crud = PoemPoemCRUD()
