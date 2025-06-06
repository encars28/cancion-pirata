from typing import List, Literal, Optional
from pydantic import BaseModel

from app.schemas.author import AuthorSearchParams, SearchAuthor
from app.schemas.collection import CollectionSearchParams, SearchCollection
from app.schemas.poem import PoemSearchParams, SearchPoem
from app.schemas.user import SearchUser, UserSearchParams

Param = Literal["author", "poem", "collection", "user"]


class Message(BaseModel):
    message: str


class SearchResult(BaseModel):
    authors: List[SearchAuthor] = []
    poems: List[SearchPoem] = []
    collections: List[SearchCollection] = []
    users: List[SearchUser] = []


class SearchParams(BaseModel):
    search_type: List[Param] = ["author", "poem", "collection", "user"]
    author_params: Optional[AuthorSearchParams] = None
    poem_params: Optional[PoemSearchParams] = None
    collection_params: Optional[CollectionSearchParams] = None
    user_params: Optional[UserSearchParams] = None
