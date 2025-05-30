from typing import List
from pydantic import BaseModel

from app.schemas.author import AuthorForSearch
from app.schemas.collection import CollectionForSearch
from app.schemas.poem import PoemForSearch
from app.schemas.user import UserForSearch


class Message(BaseModel):
    message: str
    
class SearchResult(BaseModel): 
    authors: List[AuthorForSearch] = []
    poems: List[PoemForSearch] = []
    collections: List[CollectionForSearch] = []
    users: List[UserForSearch] = []
