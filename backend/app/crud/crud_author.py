from sqlmodel import Session, select

from app.models import Author, AuthorCreate

def create_author(*, session: Session, author_in: AuthorCreate) -> Author:
    author = Author.model_validate(author_in)
    session.add(author)
    session.commit()
    session.refresh(author)
    return author

def update_author(*, session: Session, author: Author, author_in: AuthorCreate) -> Author:
    author_data = author_in.model_dump(exclude_unset=True)
    author.sqlmodel_update(author_data)
    session.add(author)
    session.commit()
    session.refresh(author)
    return author

def get_author_by_name(*, session: Session, name: str) -> Author | None:
    statement = select(Author).where(Author.name == name)
    author = session.exec(statement).first()
    return author