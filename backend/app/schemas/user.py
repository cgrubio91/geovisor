from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

class UserCreate(UserBase):
    access_code: str
    project_ids: Optional[List[int]] = []

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    access_code: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    project_ids: Optional[List[int]] = None

class User(UserBase):
    id: int
    access_code: str # Make sure access_code is visible in read schema if needed by admin

    class Config:
        from_attributes = True
