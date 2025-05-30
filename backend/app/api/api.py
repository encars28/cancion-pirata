from fastapi import APIRouter

from app.api.routes import login, users, utils, poems, collections, search, authors

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(authors.router)
api_router.include_router(poems.router)
api_router.include_router(collections.router)
api_router.include_router(search.router)