from fastapi import APIRouter

from app.api.routes import login, private, users, utils, poems
from app.core.config import settings
from app.api.routes import authors

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(authors.router)
api_router.include_router(poems.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)