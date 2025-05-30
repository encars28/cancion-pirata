from typing import Annotated, Any, Optional

from fastapi import APIRouter, Query

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
def search(q: Annotated[Optional[str], Query(max_length=255)] = None) -> Any: 
    ...

