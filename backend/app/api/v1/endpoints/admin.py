from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app import schemas

router = APIRouter()

# Mock stats for the Admin Dashboard
@router.get("/stats", response_model=Any)
def get_stats() -> Any:
    return {
        "active_users": 3,
        "total_users": 3,
        "total_projects": 3,
        "total_layers": 9,
        "avg_layers_per_project": 3.0,
        "user_distribution": {
            "admins": 1,
            "regular": 2,
            "inactive": 0
        },
        "recent_activity": [
            {"type": "user", "text": "Nuevo usuario creado: Juan Pérez", "time": "Hace 2 horas"},
            {"type": "project", "text": "Proyecto actualizado: Carretera Norte", "time": "Hace 5 horas"},
            {"type": "layer", "text": "Capa agregada: MDT - Proyecto Minería", "time": "Hace 1 día"},
            {"type": "assignment", "text": "Usuario asignado a proyecto: María González", "time": "Hace 2 días"}
        ]
    }

@router.get("/users", response_model=List[Any])
def list_users() -> Any:
    return [
        {"id": 1, "full_name": "Administrador", "access_code": "ADMIN001", "role": "Admin", "projects_count": 3, "is_active": True},
        {"id": 2, "full_name": "Juan Pérez", "access_code": "USER001", "role": "User", "projects_count": 2, "is_active": True},
        {"id": 3, "full_name": "María González", "access_code": "USER002", "role": "User", "projects_count": 2, "is_active": True}
    ]

@router.post("/users", response_model=Any)
def create_user(user: Any) -> Any:
    return {"message": "User created successfully"}

@router.get("/projects-summary", response_model=List[Any])
def list_projects_summary() -> Any:
    return [
        {"id": 1, "name": "Proyecto Carretera Norte", "users_count": 2, "layers_count": 3},
        {"id": 2, "name": "Urbanización El Bosque", "users_count": 3, "layers_count": 3},
        {"id": 3, "name": "Minería Santa Rita", "users_count": 2, "layers_count": 3}
    ]
