from app.schemas.author import AuthorCreate
from app.crud.author import author_crud
from app.models.author import Author

from app.tests.utils.utils import random_lower_string

from sqlalchemy.orm import Session

def create_random_author(db: Session) -> Author:
    name = random_lower_string()
    author_in = AuthorCreate(full_name=name)
    
    author = author_crud.create(db=db, obj_create=author_in)
    return author