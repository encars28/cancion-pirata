import json
import random
from tqdm import tqdm
from sqlalchemy.orm import Session
from app.crud.user import user_crud
from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.collection import collection_crud

from app.schemas.user import UserCreate, UserUpdate
from app.schemas.author import AuthorCreate
from app.schemas.poem import PoemCreate
from app.schemas.collection import CollectionCreate


def create_test_data(db: Session):
    with open("user_data.json", "r") as f:
        user_data = json.load(f)

    with open("author_data.json", "r") as f:
        author_data = json.load(f)

    with open("poem_data.json", "r") as f:
        poem_data = json.load(f)

    with open("collection_data.json", "r") as f:
        collection_data = json.load(f)

    users = []
    # Create users
    for user in tqdm(user_data, desc="Creating users"):
        user_in = UserCreate(**user)
        users.append(user_crud.create(db, obj_create=user_in))

    authors = []
    # Create authors
    for author in tqdm(author_data, desc="Creating authors"):
        author_in = AuthorCreate(**author)
        authors.append(author_crud.create(db, obj_create=author_in))

    # Assign users to authors
    author_basic_info = {author.full_name: author.id for author in authors}

    for user in tqdm(users, desc="Assigning authors to users"):
        if user.full_name in author_basic_info.keys():
            user_crud.update(
                db,
                obj_id=user.id,
                obj_update=UserUpdate(author_id=author_basic_info[user.full_name]),
            )

    poems = []
    # Create poems
    for poem in tqdm(poem_data, desc="Creating poems"):
        poem_in = PoemCreate(
            **poem,
            author_names=[
                author.full_name
                for author in random.sample(authors, random.randint(0, 3))
            ],
        )
        poems.append(poem_crud.create(db, obj_create=poem_in))

    # Create collections
    for collection in tqdm(collection_data, desc="Creating collections"):
        collection_in = CollectionCreate(
            **collection,
            user_id=random.choice(users).id,
            poem_ids=set(random.sample([poem.id for poem in poems], random.randint(1, 5))), 
        )
        
        collection_crud.create(db, obj_create=collection_in)
        
if __name__ == "__main__":
    with Session() as db: 
        create_test_data(db)
