from typing import Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime
from app.models.layer import LayerType, LayerFormat

# Shared properties
class LayerBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layer_type: Optional[LayerType] = None
    format: Optional[LayerFormat] = None
    layer_metadata: Optional[Dict[str, Any]] = None # Renamed to match model
    style: Optional[Dict[str, Any]] = None

# Properties to receive on creation (mostly handled via Form data in generic upload, but good to have)
class LayerCreate(LayerBase):
    name: str
    layer_type: LayerType
    format: LayerFormat

# Properties to receive on update
class LayerUpdate(LayerBase):
    pass

# Properties shared by models stored in DB
class LayerInDBBase(LayerBase):
    id: int
    project_id: int
    file_path: str
    processed_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Properties to return to client
class Layer(LayerInDBBase):
    pass

# Properties stored in DB
class LayerInDB(LayerInDBBase):
    pass
