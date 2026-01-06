# Geovisor Web Pro

Este proyecto es un geovisor avanzado desarrollado con **FastAPI (Python)** y **Angular**. Permite la gestión de proyectos técnicos con visualización de datos geoespaciales en 2D y 3D.

## Características
- Autenticación mediante códigos de acceso.
- Panel de proyectos con diseño premium (basado en Figma).
- Visor 2D con OpenLayers.
- Visor 3D con CesiumJS.
- Herramientas de medición (Distancia, Área, Volumen).
- Base de datos espacial con PostgreSQL + PostGIS.

## Tecnologías
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, GeoAlchemy2.
- **Frontend:** Angular 19+, OpenLayers, CesiumJS.
- **Base de datos:** PostgreSQL 15+ con extensión PostGIS.

## Colores del Sistema
- **Primario (Cyan):** `rgb(0, 193, 210)` (#00C1D2)
- **Secundario (Navy):** `rgb(22, 50, 85)` (#163255)
- **Acento (Naranja):** `rgb(255, 103, 28)` (#FF671C)

## Instalación y Ejecución

### Base de Datos
Si tienes Docker, puedes iniciar la base de datos con:
```bash
docker-compose up -d
```

### Backend
1. Entra a la carpeta `backend`.
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Inicia la base de datos y los datos iniciales:
   ```bash
   python app/db/init_db.py
   ```
4. Ejecuta el servidor:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend
1. Entra a la carpeta `frontend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Accede a `http://localhost:4200`.

## Créditos
Desarrollado para la gestión de proyectos de ingeniería y análisis territorial.
