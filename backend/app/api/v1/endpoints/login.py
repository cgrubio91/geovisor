from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Any
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User

router = APIRouter()

@router.post("/login/access-code")
def login_access_code(
    code: str = Body(..., embed=True),
    db: Session = Depends(get_db)
) -> Any:
    """
    Login with access code.
    """
    user = db.query(User).filter(User.access_code == code).first()
    
    if user:
        return {
            "access_token": "dummy-token",
            "token_type": "bearer",
            "user": {
                "full_name": user.full_name,
                "is_admin": user.is_admin
            }
        }
    else:
        raise HTTPException(
            status_code=400, detail="Código de acceso inválido"
        )
