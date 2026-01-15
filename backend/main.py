from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app import models
import os

app = FastAPI(
    title="Geovisor API",
    description="API for managing projects, layers and measurements in a web geovisor",
    version="1.0.0"
)

# ===============================
# 🌐 CONFIGURACIÓN DE CORS
# ===============================
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "http://localhost:56719",
    "http://127.0.0.1:56719",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length"],
)

app.include_router(api_router, prefix="/api/v1")

# ===============================
# 📁 ARCHIVOS ESTÁTICOS
# ===============================

# Asegurar que los directorios existan
os.makedirs("uploads", exist_ok=True)
os.makedirs("Datos", exist_ok=True)

# Montar carpeta de uploads
app.mount("/static/uploads", StaticFiles(directory=os.path.abspath("uploads")), name="uploads")

# Lógica para montar la carpeta Datos
paths_to_mount = [
    os.path.abspath("Datos"),
    os.path.abspath("../Datos")
]

# CORRECCIÓN: Inicializamos la variable para evitar el NameError
mounted_datos = False 

for p in paths_to_mount:
    if os.path.exists(p):
        # Verificamos si la carpeta existe y si tiene contenido
        try:
            if os.listdir(p):
                print(f"✅ Mounting {p} to /static/datos")
                app.mount("/static/datos", StaticFiles(directory=p), name="datos")
                mounted_datos = True
                break
        except Exception as e:
            print(f"⚠️ Error accediendo a {p}: {e}")

# Si después de recorrer los paths no se montó nada con archivos, 
# montamos la carpeta local por defecto para evitar errores 404
if not mounted_datos:
    default_path = os.path.abspath("Datos")
    print(f"ℹ️ No se detectaron archivos en rutas previas. Montando ruta por defecto: {default_path}")
    app.mount("/static/datos", StaticFiles(directory=default_path), name="datos")

# ===============================
# 🏠 RUTAS BASE
# ===============================
@app.get("/")
def root():
    return {"message": "Welcome to Geovisor API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)