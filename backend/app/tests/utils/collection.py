from app.schemas.collection import CollectionCreate
from app.tests.utils.poem import create_random_poem
from app.tests.utils.utils import random_lower_string

from app.crud.collection import collection_crud

def create_random_collection(db, user_id, is_public=True): 
    name = random_lower_string()
    description = random_lower_string()
    
    poem1 = create_random_poem(db, is_public=is_public)
    poem2 = create_random_poem(db, is_public=is_public)
    
    collection_in = CollectionCreate(
        name=name,
        description=description,
        user_id=user_id,
        is_public=is_public,
        poem_ids={poem1.id, poem2.id}
    )
    
    return collection_crud.create(db, obj_create=collection_in)
    