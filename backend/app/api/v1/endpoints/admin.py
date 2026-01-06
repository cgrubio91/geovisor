from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app import schemas

router = APIRouter()

from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User
from app.models.project import Project
from app.models.layer import Layer

@router.get("/stats", response_model=Any)
def get_stats(db: Session = Depends(get_db)) -> Any:
    total_users = db.query(User).count()
    total_projects = db.query(Project).count()
    total_layers = db.query(Layer).count()
    admins_count = db.query(User).filter(User.is_admin == True).count()
    
    return {
        "active_users": total_users,
        "total_users": total_users,
        "total_projects": total_projects,
        "total_layers": total_layers,
        "avg_layers_per_project": round(total_layers / total_projects, 1) if total_projects > 0 else 0,
        "user_distribution": {
            "admins": admins_count,
            "regular": total_users - admins_count,
            "inactive": 0
        },
        "recent_activity": [
            {"type": "user", "text": f"Sincronizados {total_users} usuarios", "time": "Ahora"},
            {"type": "project", "text": f"Base de datos con {total_projects} proyectos", "time": "Ahora"}
        ]
    }

@router.get("/users", response_model=List[Any])
def list_users(db: Session = Depends(get_db)) -> Any:
    users = db.query(User).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "access_code": user.access_code,
            "role": "Admin" if user.is_admin else "User",
            "projects_count": len(user.projects),
            "is_active": True
        })
    return result

@router.post("/users", response_model=Any)
def create_user(user_in: Any, db: Session = Depends(get_db)) -> Any:
    # This is a stub for now, but uses DB session
    return {"message": "User creation endpoint ready"}

@router.get("/projects-summary", response_model=List[Any])
def list_projects_summary(db: Session = Depends(get_db)) -> Any:
    projects = db.query(Project).all()
    result = []
    for p in projects:
        result.append({
            "id": p.id,
            "name": p.name,
            "users_count": len(p.users),
            "layers_count": len(p.layers)
        })
    return result
