from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.post("/projects/{project_id}/measurements/", response_model=schemas.measurement.Measurement)
def create_measurement(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    measurement_in: schemas.measurement.MeasurementCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new measurement for a project.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Convert GeoJSON to WKT for PostGIS
    from shapely.geometry import shape
    try:
        print(f"DEBUG: Processing geometry type: {type(measurement_in.geometry)}")
        wkt_geometry = shape(measurement_in.geometry).wkt
        print(f"DEBUG: WKT Result: {wkt_geometry[:50]}...")
    except Exception as e:
        print(f"DEBUG: Geometry Error: {e}")
        raise HTTPException(status_code=422, detail=f"Invalid geometry: {str(e)}")

    measurement_data = measurement_in.dict()
    # Ensure we replace the dict with the WKT string
    measurement_data['geometry'] = wkt_geometry

    print("DEBUG: Creating measurement object...")
    measurement = models.Measurement(
        **measurement_data,
        project_id=project.id
    )
    db.add(measurement)
    try:
        db.commit()
    except Exception as e:
        print(f"DEBUG: Commit Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    db.refresh(measurement)
    return measurement

@router.get("/projects/{project_id}/measurements/", response_model=List[schemas.measurement.Measurement])
def read_measurements(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve measurements for a project.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    measurements = db.query(models.Measurement).filter(
        models.Measurement.project_id == project_id
    ).offset(skip).limit(limit).all()
    return measurements

@router.delete("/measurements/{id}", response_model=schemas.measurement.Measurement)
def delete_measurement(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a measurement.
    """
    measurement = db.query(models.Measurement).filter(models.Measurement.id == id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
        
    project = db.query(models.Project).filter(models.Project.id == measurement.project_id).first()
    if not current_user.is_superuser and project.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    db.delete(measurement)
    db.commit()
    return measurement
