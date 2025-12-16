import shutil
import os
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import uuid4

from app import models, schemas
from app.api import deps
from app.core.config import settings
from app.models.layer import LayerType, LayerFormat

router = APIRouter()

@router.post("/projects/{project_id}/layers/", response_model=schemas.layer.Layer)
def create_upload_layer(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(None),
    layer_type: LayerType = Form(...),
    format: LayerFormat = Form(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a file and create a new layer for a project.
    """
    # 1. Check Project Permissions
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # 2. Prepare File Path
    # Use UUID to prevent filename collisions
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid4()}{file_ext}"
    
    # Ensure upload directory exists
    # If path starts with ../ resolve it relative to backend root or absolute
    # For simplicity assuming CWD is backend root
    upload_dir = settings.UPLOAD_DIR
    if not os.path.isabs(upload_dir):
        upload_dir = os.path.join(os.getcwd(), upload_dir)
    
    os.makedirs(upload_dir, exist_ok=True)
    
    file_location = os.path.join(upload_dir, safe_filename)

    # 3. Save File
    try:
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Could not save file")

    # 4. Create DB Record
    # Calculate size
    file_size = os.path.getsize(file_location)

    layer = models.Layer(
        name=name,
        description=description,
        layer_type=layer_type,
        format=format,
        project_id=project_id,
        file_path=file_location,
        file_size=file_size,
        original_filename=file.filename,
        # Default metadata
        layer_metadata={} 
    )
    
    db.add(layer)
    db.commit()
    db.refresh(layer)
    
    return layer

@router.get("/projects/{project_id}/layers/", response_model=List[schemas.layer.Layer])
def read_project_layers(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve layers for a specific project.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    layers = db.query(models.Layer).filter(
        models.Layer.project_id == project_id
    ).offset(skip).limit(limit).all()
    
    return layers

@router.delete("/layers/{layer_id}", response_model=schemas.layer.Layer)
def delete_layer(
    *,
    db: Session = Depends(deps.get_db),
    layer_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a layer and its file.
    """
    layer = db.query(models.Layer).filter(models.Layer.id == layer_id).first()
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")
        
    # Check project permissions via relationship
    project = db.query(models.Project).filter(models.Project.id == layer.project_id).first()
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Delete physical file
    if layer.file_path and os.path.exists(layer.file_path):
        try:
            os.remove(layer.file_path)
        except Exception:
            pass # Continue deleting record even if file deletion fails
            
    db.delete(layer)
    db.commit()
    return layer
