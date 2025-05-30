from typing import Annotated, Any

from fastapi import APIRouter, Query

from app.api.deps import OptionalCurrentUser, SessionDep
from app.schemas.author import AuthorForSearch
from app.schemas.collection import CollectionForSearch
from app.schemas.common import SearchResult

from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.user import user_crud
from app.crud.collection import collection_crud
from app.schemas.poem import PoemForSearch
from app.schemas.user import UserForSearch

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=SearchResult)
def search(session: SessionDep, current_user: OptionalCurrentUser, q: Annotated[str, Query(max_length=255)] = "") -> Any: 
    """
    Universal search
    """
    
    authors = author_crud.get_many_for_search(session, q)
    users = user_crud.get_many(session, query=q)
    
    if current_user and current_user.is_superuser: 
        poems = poem_crud.get_many_for_search(session, q, public_restricted=False)
        collections = collection_crud.get_many(session, query=q, public_restricted=False)
        
    else: 
        poems = poem_crud.get_many_for_search(session, q, public_restricted=True)
        collections = collection_crud.get_many(session, query=q, public_restricted=True)
        
    return SearchResult(
        authors=[AuthorForSearch.model_validate(author) for author in authors],
        users=[UserForSearch.model_validate(user) for user in users],
        poems=[PoemForSearch.model_validate(poem) for poem in poems],
        collections=[CollectionForSearch.model_validate(collection) for collection in collections]
    )
    
    

