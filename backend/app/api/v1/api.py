from fastapi import APIRouter
from app.api.v1.endpoints import login, projects, layers, measurements, admin, files, analysis

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(layers.router, prefix="/layers", tags=["layers"])
api_router.include_router(measurements.router, prefix="/measurements", tags=["measurements"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
