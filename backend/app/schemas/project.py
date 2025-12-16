from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.project import ProjectMemberRole

# Shared properties
class ProjectBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Properties to receive on item creation
class ProjectCreate(ProjectBase):
    name: str

# Properties to receive on item update
class ProjectUpdate(ProjectBase):
    pass

# Properties shared by models stored in DB
class ProjectInDBBase(ProjectBase):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Properties to return to client
class Project(ProjectInDBBase):
    pass

# Properties stored in DB
class ProjectInDB(ProjectInDBBase):
    pass
