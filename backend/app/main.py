from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine
from app.models import user, project, layer, measurement

# Create database tables
# user.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="GeoVisor - Plataforma de visualización y análisis geoespacial",
    docs_url="/docs",
    redoc_url="/redoc"
)

from fastapi.staticfiles import StaticFiles
import os

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (uploads)
upload_dir = settings.UPLOAD_DIR
if not os.path.isabs(upload_dir):
    upload_dir = os.path.join(os.getcwd(), upload_dir)
os.makedirs(upload_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=upload_dir), name="static")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Bienvenido a GeoVisor API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Import and include routers
from app.api import auth, users, projects, layers, measurements
# from app.api import analysis

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(layers.router, prefix="/api", tags=["Layers"])
app.include_router(measurements.router, prefix="/api", tags=["Measurements"])
# app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
