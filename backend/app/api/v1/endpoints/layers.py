from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlalchemy.orm import Session
from app.api.deps import get_db
from app import schemas
from app.crud import crud_layer

router = APIRouter()

@router.get("/{project_id}", response_model=List[schemas.Layer])
def read_layers(
    project_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[schemas.Layer]:
    """Retrieve layers for a given project with pagination."""
    layers = crud_layer.get_layers(db, project_id=project_id, skip=skip, limit=limit)
    return layers

@router.get("/layer/{layer_id}", response_model=schemas.Layer)
def read_layer(
    layer_id: int,
    db: Session = Depends(get_db),
) -> schemas.Layer:
    layer = crud_layer.get_layer(db, layer_id=layer_id)
    if not layer:
        raise HTTPException(status_code=404, detail="Layer not found")
    return layer

@router.post("/", response_model=schemas.Layer)
def create_layer(
    layer_in: schemas.LayerCreate,
    db: Session = Depends(get_db),
) -> schemas.Layer:
    return crud_layer.create_layer(db, layer=layer_in)

@router.put("/layer/{layer_id}", response_model=schemas.Layer)
def update_layer(
    layer_id: int,
    layer_in: schemas.LayerUpdate,
    db: Session = Depends(get_db),
) -> schemas.Layer:
    updated = crud_layer.update_layer(db, layer_id=layer_id, layer_update=layer_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Layer not found")
    return updated

@router.delete("/layer/{layer_id}")
def delete_layer(
    layer_id: int,
    db: Session = Depends(get_db),
) -> dict:
    success = crud_layer.delete_layer(db, layer_id=layer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Layer not found")
    return {"detail": "Layer deleted"}
