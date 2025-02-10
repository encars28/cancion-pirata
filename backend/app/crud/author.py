from app.models.author import Author
from app.crud.base import CRUDRepository

author_crud = CRUDRepository(model=Author)