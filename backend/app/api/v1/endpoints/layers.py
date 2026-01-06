from fastapi import APIRouter
from typing import Any, List

router = APIRouter()

@router.get("/{project_id}", response_model=List[Any])
def read_layers(project_id: int) -> Any:
    return []
