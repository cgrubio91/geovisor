from pydantic import BaseModel
from typing import Optional, Dict, Any

class MeasurementBase(BaseModel):
    name: Optional[str] = None
    type: str  # distance, area, volume, etc.
    value: float
    unit: str  # m, m2, m3, etc.
    geometry: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    project_id: int

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    project_id: Optional[int] = None

class Measurement(MeasurementBase):
    id: int

    class Config:
        from_attributes = True
