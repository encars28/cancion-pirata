from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from app.crud import crud_author
from app.models import Author, AuthorCreate, AuthorUpdate
from app.tests.utils.utils import random_lower_string
from app.tests.utils.poem import create_random_author


def test_create_author(db: Session) -> None:
    name = random_lower_string()
    author_in = AuthorCreate(name=name)
    author = crud_author.create_author(session=db, author_in=author_in)
    assert author.name == name


def test_get_author(db: Session) -> None:
    author = create_random_author(db)
    author_2 = db.get(Author, author.id)
    assert author_2
    assert author.name == author_2.name
    assert jsonable_encoder(author) == jsonable_encoder(author_2)


def test_update_author(db: Session) -> None:
    author = create_random_author(db)
    # new_name = random_lower_string()
    
    # author_in_update = AuthorUpdate(name=new_name)
    
    author_in_update = AuthorUpdate(birth_year=1990)
                                    
    if author.id is not None:
        crud_author.update_author(session=db, author=author, author_in=author_in_update)
        
    author_2 = db.get(Author, author.id)
    assert author_2
    # assert author.name == author_2.name
    assert author.birth_year == author_2.birth_year