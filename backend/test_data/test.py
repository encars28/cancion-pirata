from sqlalchemy.orm import Session
from app.schemas.poem import PoemCreate
from app.crud.poem import poem_crud 
from app.core.db import engine

with Session(engine) as session:
    poem_in = PoemCreate(title='a', content='b')
    poem = poem_crud.create(db=session, obj_create=poem_in)
    print(poem)