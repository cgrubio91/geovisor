from typing import Optional, Any, Dict
from pydantic import BaseModel
from app.models.measurement import MeasurementType, MeasurementUnit

class MeasurementBase(BaseModel):
    name: Optional[str] = "Medición sin título"
    measurement_type: MeasurementType
    value: float
    unit: MeasurementUnit
    geometry: Dict[str, Any] # GeoJSON Geometry (Point, LineString, Polygon)

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementInDBBase(MeasurementBase):
    id: int
    project_id: int
    created_at: Any = None 

    class Config:
        from_attributes = True

class Measurement(MeasurementInDBBase):
    pass
