from fastapi import APIRouter, HTTPException, Body
from typing import Any

router = APIRouter()

@router.post("/login/access-code")
def login_access_code(
    code: str = Body(..., embed=True)
) -> Any:
    """
    Login with access code.
    """
    # Dummy logic: if code starts with 'GEO', allow login
    if code.startswith("GEO"):
        return {
            "access_token": "dummy-token",
            "token_type": "bearer",
            "user": {
                "full_name": "Administrador",
                "is_admin": True
            }
        }
    else:
        raise HTTPException(
            status_code=400, detail="Invalid access code"
        )
