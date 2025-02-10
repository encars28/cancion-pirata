from app.crud.base import CRUDRepository

from sqlalchemy.orm import Session
from app.models.poem import Poem, Poem_Poem
from app.models.author import Author

class PoemRepository(CRUDRepository):
    def update_author(self, db: Session, db_obj: Poem, author: Author) -> Poem:
        db_obj.author.append(author)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    
poem_crud = PoemRepository(model=Poem)
poem_poem_crud = PoemRepository(model=Poem_Poem)