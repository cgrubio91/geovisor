from pydantic import BaseModel
from typing import Optional, Dict, Any

class LayerBase(BaseModel):
    name: str
    layer_type: str  # e.g., vector, raster, dem, pointcloud
    format: str      # e.g., geojson, kml, shapefile
    file_path: str
    metadata_info: Optional[Dict[str, Any]] = None
    project_id: int

class LayerCreate(LayerBase):
    pass

class LayerUpdate(BaseModel):
    name: Optional[str] = None
    layer_type: Optional[str] = None
    format: Optional[str] = None
    file_path: Optional[str] = None
    metadata_info: Optional[Dict[str, Any]] = None
    project_id: Optional[int] = None

class Layer(LayerBase):
    id: int

    class Config:
        from_attributes = True
