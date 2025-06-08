from typing import Any

from fastapi import APIRouter

from app.api.deps import OptionalCurrentUser, SessionDep
from app.schemas.author import AuthorPublic, AuthorPublicBasic, AuthorSearchParams, AuthorsPublic
from app.schemas.collection import CollectionPublicBasic, CollectionPublicWithPoems, CollectionSearchParams, CollectionsPublic
from app.schemas.search import SearchParams, SearchResult

from app.crud.author import author_crud
from app.crud.poem import poem_crud
from app.crud.user import user_crud
from app.crud.collection import collection_crud
from app.schemas.poem import PoemPublic, PoemPublicBasic, PoemSearchParams, PoemsPublic
from app.schemas.user import UserPublicBasic, UserSearchParams, UserPublic, UsersPublic

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResult)
def search(session: SessionDep, current_user: OptionalCurrentUser, params: SearchParams) -> Any: 
    """
    Universal search
    """
    
    if "author" in params.search_type:
        if params.author_params is None:
            authors = author_crud.get_many(session, AuthorSearchParams())
        else: 
            authors = author_crud.get_many(session, params.author_params)
        
        if params.author_params is None or params.author_params.author_basic: 
            authors = [AuthorPublicBasic.model_validate(author) for author in authors]
        else: 
            author_data = [AuthorPublic.model_validate(author) for author in authors]
            count = author_crud.get_count(session, params.author_params)
            authors = AuthorsPublic(data=author_data, count=count)
    else:
        authors = []
        
    if "user" in params.search_type:
        if params.user_params is None:
            users = user_crud.get_many(session, UserSearchParams())
        else: 
            users = user_crud.get_many(session, params.user_params)
        
        if params.user_params is None or params.user_params.user_basic:
            users = [UserPublicBasic.model_validate(user) for user in users]
        else: 
            user_data = [UserPublic.model_validate(user) for user in users]
            count = user_crud.get_count(session, params.user_params)
            users = UsersPublic(data=user_data, count=count)
            
    else:
        users = []
    
    if current_user and current_user.is_superuser: 
        public_restricted = False
    else: 
        public_restricted = True
        
    if "poem" in params.search_type:
        if params.poem_params is None:
            poems = poem_crud.get_many(session, PoemSearchParams(), public_restricted=public_restricted)
        else: 
            poems = poem_crud.get_many(session, params.poem_params, public_restricted=public_restricted)
            
        if not (current_user and current_user.is_superuser):
            for poem in poems: 
                if not poem.show_author:
                    poem.author_names = []
                    
        if params.poem_params is None or params.poem_params.poem_basic:
            poems = [PoemPublicBasic.model_validate(poem) for poem in poems]
        else: 
            poem_data = [PoemPublic.model_validate(poem) for poem in poems]
            count = poem_crud.get_count(session, params.poem_params, public_restricted=public_restricted)
            poems = PoemsPublic(data=poem_data, count=count)
                    
    else:
        poems = []
        
    if "collection" in params.search_type:
        if params.collection_params is None:
            collections = collection_crud.get_many(session, CollectionSearchParams(), public_restricted=public_restricted)
        else: 
            collections = collection_crud.get_many(session, params.collection_params, public_restricted=public_restricted)
            
        if params.collection_params is None or params.collection_params.collection_basic:
            collections = [CollectionPublicBasic.model_validate(collection) for collection in collections]
        else: 
            collection_data = [CollectionPublicWithPoems.model_validate(collection) for collection in collections]
            count = collection_crud.get_count(session, params.collection_params, public_restricted=public_restricted)
            collections = CollectionsPublic(data=collection_data, count=count)
        
    else:
        collections = []
        
    return SearchResult(
        authors=authors,
        users=users,
        poems=poems,
        collections=collections
    )
    
    

