# 🌍 GeoVisor

**GeoVisor** es una plataforma web de visualización y análisis de documentos georeferenciados que permite gestionar proyectos geoespaciales, visualizar diferentes tipos de datos (KML, KMZ, LAS, ortofotos, modelos Revit), realizar mediciones de área y volumen, y colaborar en proyectos con gestión de usuarios y permisos.

---

## 🚀 Características Principales

- 🗺️ **Visor 2D y 3D**: Visualización interactiva con OpenLayers y Cesium
- 📁 **Múltiples Formatos**: Soporte para KML, KMZ, LAS/LAZ, GeoTIFF, Shapefile
- 📏 **Mediciones**: Distancia, área, perímetro y volumen
- 🔬 **Análisis Geoespacial**: Buffer, intersección, unión, curvas de nivel
- 👥 **Gestión de Usuarios**: Sistema completo de autenticación y permisos
- 📊 **Gestión de Proyectos**: Organización por proyectos con colaboración
- ☁️ **Nubes de Puntos**: Visualización de archivos LAS con Potree
- 💾 **Exportación**: KML, GeoJSON, Shapefile, PDF

---

## 🛠️ Stack Tecnológico

### Frontend
- React 18
- Vite
- OpenLayers 8 (Mapas 2D)
- Cesium.js (Mapas 3D)
- Potree (Nubes de puntos)
- TailwindCSS
- Axios
- React Query
- Zustand

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL + PostGIS
- GDAL
- PDAL
- Alembic

---

## 📋 Requisitos Previos

- Python 3.11 o superior
- Node.js 18 o superior
- Docker y Docker Compose
- Git

---

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/geovisor.git
cd geovisor
```

### 2. Configurar Base de Datos (Docker)

```bash
docker-compose up -d postgres
```

### 3. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

El backend estará disponible en: `http://localhost:8000`

### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🐳 Uso con Docker (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

---

## 📚 Documentación

- [Plan del Proyecto](PROJECT_PLAN.md)
- [Checklist de Desarrollo](DEVELOPMENT_CHECKLIST.md)
- [Documentación de API](http://localhost:8000/docs) (cuando el servidor esté corriendo)

---

## 🗂️ Estructura del Proyecto

```
geovisor/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints
│   │   ├── core/        # Configuración y seguridad
│   │   ├── models/      # Modelos de BD
│   │   ├── schemas/     # Schemas Pydantic
│   │   └── services/    # Lógica de negocio
│   ├── alembic/         # Migraciones
│   └── requirements.txt
├── frontend/            # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API client
│   │   └── store/       # Estado global
│   └── package.json
├── data/                # Datos y uploads
├── docs/                # Documentación
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run test
```

---

## 📦 Formatos Soportados

| Formato | Tipo | Descripción |
|---------|------|-------------|
| KML/KMZ | Vector | Archivos de Google Earth |
| LAS/LAZ | Nube de puntos | Datos LiDAR |
| GeoTIFF | Raster | Ortofotos y mapas raster |
| Shapefile | Vector | Formato ESRI |
| GeoJSON | Vector | Formato web estándar |
| IFC | 3D Model | Modelos BIM (desde Revit) |

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**GeoVisor Team**

---

## 🙏 Agradecimientos

- OpenLayers
- Cesium.js
- Potree
- FastAPI
- PostGIS
- GDAL/PDAL

---

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un [issue](https://github.com/tu-usuario/geovisor/issues).

---

**¡Feliz mapeo! 🗺️**
