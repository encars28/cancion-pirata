from app.models.author import Author
from app.crud.base import CRUDRepository
from app.schemas.author import AuthorSchema

author_crud = CRUDRepository(model=Author, schema=AuthorSchema)