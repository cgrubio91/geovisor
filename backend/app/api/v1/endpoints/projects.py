from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any, Optional
from app import schemas
from app.api.deps import get_db
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.user import User
from app.crud import crud_project

router = APIRouter()

@router.get("/", response_model=List[schemas.Project])
def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    return crud_project.get_projects(db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=schemas.Project)
def read_project(
    project_id: int,
    db: Session = Depends(get_db)
) -> Any:
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=schemas.Project)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db)
) -> Any:
    return crud_project.create_project(db, project=project_in)

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db)
) -> Any:
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return crud_project.update_project(db, project_id=project_id, project=project_in)

@router.delete("/{project_id}", response_model=schemas.Project)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
) -> Any:
    project = crud_project.delete_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
