from typing import Annotated, Any

from fastapi import APIRouter, Query

from app.api.deps import OptionalCurrentUser, SearchQuery, SessionDep
from app.schemas.author import AuthorSearchParams, SearchAuthor
from app.schemas.collection import SearchCollection, CollectionSearchParams
from app.schemas.common import SearchResult

from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.user import user_crud
from app.crud.collection import collection_crud
from app.schemas.poem import SearchPoem, PoemSearchParams
from app.schemas.user import SearchUser, UserSearchParams

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=SearchResult)
def search(session: SessionDep, current_user: OptionalCurrentUser, search_params: SearchQuery) -> Any: 
    """
    Universal search
    """
    
    if "author" in search_params.search_type:
        if search_params.author_params is None:
            authors = author_crud.get_many(session, AuthorSearchParams())
        else: 
            authors = author_crud.get_many(session, search_params.author_params)
    else:
        authors = []
        
    if "user" in search_params.search_type:
        if search_params.user_params is None:
            users = user_crud.get_many(session, UserSearchParams())
        else: 
            users = user_crud.get_many(session, search_params.user_params)
    else:
        users = []
    
    if current_user and current_user.is_superuser: 
        public_restricted = False
    else: 
        public_restricted = True
        
    if "poem" in search_params.search_type:
        if search_params.poem_params is None:
            poems = poem_crud.get_many(session, PoemSearchParams(), public_restricted=public_restricted)
        else: 
            poems = poem_crud.get_many(session, search_params.poem_params, public_restricted=public_restricted)
            
        if not (current_user and current_user.is_superuser):
            for poem in poems: 
                if not poem.show_author:
                    poem.author_names = []
                    
    else:
        poems = []
        
    if "collection" in search_params.search_type:
        if search_params.collection_params is None:
            collections = collection_crud.get_many(session, CollectionSearchParams(), public_restricted=public_restricted)
        else: 
            collections = collection_crud.get_many(session, search_params.collection_params, public_restricted=public_restricted)
    else:
        collections = []
        
    return SearchResult(
        authors=[SearchAuthor.model_validate(author) for author in authors],
        users=[SearchUser.model_validate(user) for user in users],
        poems=[SearchPoem.model_validate(poem) for poem in poems],
        collections=[SearchCollection.model_validate(collection) for collection in collections]
    )
    
    

