from fastapi import APIRouter
from app.api.v1.endpoints import login, projects, layers, measurements, admin

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(layers.router, prefix="/layers", tags=["layers"])
api_router.include_router(measurements.router, prefix="/measurements", tags=["measurements"])
