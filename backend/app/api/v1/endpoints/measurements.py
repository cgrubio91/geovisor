from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlalchemy.orm import Session
from app.api.deps import get_db
from app import schemas
from app.crud import crud_measurement

router = APIRouter()

@router.get("/{project_id}", response_model=List[schemas.Measurement])
def read_measurements(
    project_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[schemas.Measurement]:
    """Retrieve measurements for a given project with pagination."""
    measurements = crud_measurement.get_measurements(db, project_id=project_id, skip=skip, limit=limit)
    return measurements

@router.get("/measurement/{measurement_id}", response_model=schemas.Measurement)
def read_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
) -> schemas.Measurement:
    measurement = crud_measurement.get_measurement(db, measurement_id=measurement_id)
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return measurement

@router.post("/", response_model=schemas.Measurement)
def create_measurement(
    measurement_in: schemas.MeasurementCreate,
    db: Session = Depends(get_db),
) -> schemas.Measurement:
    return crud_measurement.create_measurement(db, measurement=measurement_in)

@router.put("/measurement/{measurement_id}", response_model=schemas.Measurement)
def update_measurement(
    measurement_id: int,
    measurement_in: schemas.MeasurementUpdate,
    db: Session = Depends(get_db),
) -> schemas.Measurement:
    updated = crud_measurement.update_measurement(db, measurement_id=measurement_id, measurement_update=measurement_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return updated

@router.delete("/measurement/{measurement_id}")
def delete_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
) -> dict:
    success = crud_measurement.delete_measurement(db, measurement_id=measurement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return {"detail": "Measurement deleted"}
