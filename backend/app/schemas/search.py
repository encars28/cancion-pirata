from typing import List, Literal, Optional
from pydantic import BaseModel
from app.schemas.author import AuthorPublicBasic, AuthorQuery, AuthorSearchParams, AuthorsPublic
from app.schemas.poem import PoemPublicBasic, PoemsPublic, PoemSearchParams
from app.schemas.collection import CollectionPublicBasic, CollectionsPublic, CollectionSearchParams
from app.schemas.user import UserPublicBasic, UserSearchParams, UsersPublic

Param = Literal["author", "poem", "collection", "user"]

class SearchResult(BaseModel):
    authors: List[AuthorPublicBasic] | AuthorsPublic = []
    poems: List[PoemPublicBasic] | PoemsPublic = []
    collections: List[CollectionPublicBasic] | CollectionsPublic = []
    users: List[UserPublicBasic] | UsersPublic = []


class SearchParams(BaseModel):
    search_type: List[Param] = ["author", "poem", "collection", "user"]
    author_params: Optional[AuthorSearchParams] = None
    poem_params: Optional[PoemSearchParams] = None
    collection_params: Optional[CollectionSearchParams] = None
    user_params: Optional[UserSearchParams] = None