from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    stage: Optional[str] = "Planificación"
    status: Optional[str] = "active"

class ProjectCreate(ProjectBase):
    user_ids: Optional[List[int]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    stage: Optional[str] = None
    user_ids: Optional[List[int]] = None
    location: Optional[str] = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    users: List['User'] = []
    layers: List['Layer'] = []

    class Config:
        from_attributes = True

from .user import User
from .layer import Layer
Project.model_rebuild()

