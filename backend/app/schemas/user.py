from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

class UserCreate(UserBase):
    access_code: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
