from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core import security

router = APIRouter()


@router.get("/me", response_model=schemas.user.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=schemas.user.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: str = Body(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = schemas.user.UserUpdate(**current_user_data)
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email

    if password:
        hashed_password = security.get_password_hash(password)
        current_user.hashed_password = hashed_password
    
    if full_name:
        current_user.full_name = full_name
    
    if email:
        # Check if email is already taken
        user = db.query(models.User).filter(models.User.email == email).first()
        if user and user.id != current_user.id:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
        current_user.email = email

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
