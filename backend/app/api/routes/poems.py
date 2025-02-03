# import uuid
# from typing import Any

# from fastapi import APIRouter, HTTPException
# from sqlmodel import func, select

# from app.api.deps import CurrentUser, SessionDep
# from app.models import (
#     OriginalPoem, 
#     PoemVersion, 
#     PoemTranslation,
#     OriginalPoemsPublic,
#     PoemVersionsPublic,
#     PoemTranslationsPublic,
#     OriginalPoemPublic,
#     PoemVersionPublic,
#     PoemTranslationPublic,
#     OriginalPoemCreate,
#     PoemVersionCreate,
#     PoemTranslationCreate,
#     Author,
#     AuthorCreate,
#     UserUpdate,
# )

# from app.crud import crud_poems, crud_author, crud_user

# router = APIRouter(prefix="/poems", tags=["poems"])


# @router.get("/", response_model=OriginalPoemsPublic)
# def read_original_poems(
#     session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
# ) -> Any:
#     """
#     Retrieve original poems.
#     """
    
#     if current_user.author_id is None: 
#         return OriginalPoemsPublic(data=[], count=0)

#     count_statement = (
#         select(func.count())
#         .select_from(OriginalPoem)
#         .where(OriginalPoem.author_id == current_user.author_id)
#     )
#     count = session.exec(count_statement).one()
#     statement = (
#         select(OriginalPoem)
#         .where(OriginalPoem.author_id == current_user.author_id)
#         .offset(skip)
#         .limit(limit)
#     )
#     poems = session.exec(statement).all()

#     return OriginalPoemsPublic(data=poems, count=count)


# @router.get("/translations", response_model=PoemTranslationsPublic)
# def read_translations(
#     session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
# ) -> Any:
#     """
#     Retrieve translations.
#     """
    
#     if current_user.author_id is None: 
#         return PoemTranslationsPublic(data=[], count=0)

#     count_statement = (
#         select(func.count())
#         .select_from(PoemTranslation)
#         .where(PoemTranslation.author_id == current_user.author_id)
#     )
#     count = session.exec(count_statement).one()
#     statement = (
#         select(PoemTranslation)
#         .where(PoemTranslation.author_id == current_user.author_id)
#         .offset(skip)
#         .limit(limit)
#     )
#     poems = session.exec(statement).all()

#     return PoemTranslationsPublic(data=poems, count=count)

# @router.get("/{id}", response_model=OriginalPoemPublic)
# def read_poem(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
#     """
#     Get poem by ID.
#     """
#     poem = session.get(OriginalPoem, id)
#     if not poem:
#         raise HTTPException(status_code=404, detail="Poem not found")
#     if current_user.author_id is None or poem.author_id != current_user.author_id:
#         raise HTTPException(status_code=400, detail="Not enough permissions")
    
#     return poem

# @router.get("/translations/{id}", response_model=PoemTranslationPublic)
# def read_translation(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
#     """
#     Get translation by ID.
#     """
#     poem = session.get(PoemTranslation, id)
#     if not poem:
#         raise HTTPException(status_code=404, detail="Poem not found")
#     if current_user.author_id is None or poem.author_id != current_user.author_id:
#         raise HTTPException(status_code=400, detail="Not enough permissions")
    
#     return poem


# @router.post("/", response_model=OriginalPoemPublic)
# def create_poem(
#     *, session: SessionDep, current_user: CurrentUser, poem_in: OriginalPoemCreate
# ) -> Any:
#     """
#     Create new poem.
#     """
    
#     if poem_in.author_id is None:
#         if current_user.author_id:
#             poem_in.author_id = current_user.author_id
            
#         elif current_user.full_name:
#             author_in = AuthorCreate(name=current_user.full_name)
#             author = crud_author.create_author(session, author_in)
            
#             user_in = UserUpdate(author_id=author.id)
#             current_user = crud_user.update_user(session, current_user, user_in)
            
#             poem_in.author_id = author.id
        
#         else: 
#             raise HTTPException(status_code=400, detail="Update your name to become an author")
            
#     poem = crud_poems.create_poem(session, poem_in)
    
#     return poem
        
        


# @router.put("/{id}", response_model=OriginalPoemPublic)
# def update_item(
#     *,
#     session: SessionDep,
#     current_user: CurrentUser,
#     id: uuid.UUID,
#     poem_in: ItemUpdate,
# ) -> Any:
#     """
#     Update an poem.
#     """
#     poem = session.get(Item, id)
#     if not poem:
#         raise HTTPException(status_code=404, detail="Item not found")
#     if not current_user.is_superuser and (poem.owner_id != current_user.id):
#         raise HTTPException(status_code=400, detail="Not enough permissions")
#     update_dict = poem_in.model_dump(exclude_unset=True)
#     poem.sqlmodel_update(update_dict)
#     session.add(poem)
#     session.commit()
#     session.refresh(poem)
#     return poem


# @router.delete("/{id}")
# def delete_item(
#     session: SessionDep, current_user: CurrentUser, id: uuid.UUID
# ) -> Message:
#     """
#     Delete an poem.
#     """
#     poem = session.get(Item, id)
#     if not poem:
#         raise HTTPException(status_code=404, detail="Item not found")
#     if not current_user.is_superuser and (poem.owner_id != current_user.id):
#         raise HTTPException(status_code=400, detail="Not enough permissions")
#     session.delete(poem)
#     session.commit()
#     return Message(message="Item deleted successfully")