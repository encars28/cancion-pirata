from app.crud.base import CRUDRepository
from typing import List

from sqlalchemy.orm import Session
from app.models.poem import Poem, Poem_Poem
from app.models.author import Author

from app.schemas.poem import PoemPoemSchema, PoemSchema

class PoemRepository(CRUDRepository):
    def update_authors(self, db: Session, db_obj: Poem, authors: List[Author]) -> Poem:
        db_obj.authors += authors
        db.commit()
        db.refresh(db_obj)
        return db_obj  
        
poem_crud = PoemRepository(model=Poem, schema=PoemSchema)

poem_poem_crud = PoemRepository(model=Poem_Poem, schema=PoemPoemSchema)