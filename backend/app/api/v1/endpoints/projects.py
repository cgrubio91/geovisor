from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app import schemas

router = APIRouter()

# Mock projects based on the Figma image
MOCK_PROJECTS = [
    {
        "id": 1,
        "name": "Proyecto Carretera Norte",
        "description": "Levantamiento topográfico carretera norte - Km 0+000 a Km 15+500",
        "location": "Norte",
        "created_at": "2025-11-14T00:00:00",
        "status": "Activo"
    },
    {
        "id": 2,
        "name": "Urbanización El Bosque",
        "description": "Proyecto de urbanización - 120 hectáreas",
        "location": "El Bosque",
        "created_at": "2025-11-30T00:00:00",
        "status": "Activo"
    },
    {
        "id": 3,
        "name": "Minería Santa Rita",
        "description": "Cálculo de volúmenes de extracción",
        "location": "Santa Rita",
        "created_at": "2025-10-19T00:00:00",
        "status": "Activo"
    }
]

@router.get("/", response_model=List[Any])
def read_projects() -> Any:
    """
    Retrieve projects.
    """
    return MOCK_PROJECTS

@router.get("/{project_id}", response_model=Any)
def read_project(project_id: int) -> Any:
    project = next((p for p in MOCK_PROJECTS if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
