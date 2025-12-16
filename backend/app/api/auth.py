from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
from app.core import security
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=schemas.auth.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
         # Generic error message to prevent enumeration
         raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.user.User)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.user.UserCreate,
) -> Any:
    """
    Create new user. 
    Note: In production this should be protected to Admin only.
    """
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists",
        )
    
    # Check email only if provided
    if user_in.email:
        user_email = db.query(models.User).filter(models.User.email == user_in.email).first()
        if user_email:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists",
            )
        
    user_obj = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or models.UserRole.USER,
        is_active=True,
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj
