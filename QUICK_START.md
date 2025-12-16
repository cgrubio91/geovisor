# 🚀 GeoVisor - Guía de Inicio Rápido

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Iniciar Base de Datos

```bash
# En la raíz del proyecto
docker-compose up -d postgres

# Verificar que está corriendo
docker ps
```

### Paso 2: Configurar Backend

```bash
cd backend

# Crear entorno virtual (solo la primera vez)
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias (solo la primera vez)
pip install -r requirements.txt

# Configurar variables de entorno (solo la primera vez)
copy .env.example .env
# Editar .env si es necesario

# Iniciar servidor
uvicorn app.main:app --reload
```

**Backend disponible en**: http://localhost:8000  
**Documentación API**: http://localhost:8000/docs

### Paso 3: Configurar Frontend

```bash
# En otra terminal
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Configurar variables de entorno (solo la primera vez)
copy .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

**Frontend disponible en**: http://localhost:5173

---

## 🔧 Configuración de Migraciones (Primera vez)

```bash
cd backend
venv\Scripts\activate

# Inicializar Alembic
alembic init alembic

# Editar alembic.ini - cambiar sqlalchemy.url a:
# sqlalchemy.url = postgresql://geovisor_user:geovisor_password_2024@localhost:5432/geovisor

# Editar alembic/env.py - agregar después de las importaciones:
# from app.database import Base
# from app.models import user, project, layer, measurement
# target_metadata = Base.metadata

# Crear migración inicial
alembic revision --autogenerate -m "Initial migration"

# Ejecutar migraciones
alembic upgrade head
```

---

## 📋 Checklist de Verificación

- [ ] PostgreSQL corriendo (puerto 5432)
- [ ] Backend corriendo (puerto 8000)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Puedes acceder a http://localhost:8000/docs
- [ ] Puedes acceder a http://localhost:5173
- [ ] Base de datos creada y migraciones ejecutadas

---

## 🐛 Solución de Problemas

### Error: "No module named 'app'"
```bash
# Asegúrate de estar en la carpeta backend
cd backend
# Y que el entorno virtual esté activado
venv\Scripts\activate
```

### Error: "Connection refused" (PostgreSQL)
```bash
# Verificar que PostgreSQL está corriendo
docker ps

# Si no está corriendo, iniciarlo
docker-compose up -d postgres

# Ver logs
docker-compose logs postgres
```

### Error: GDAL no se instala
```bash
# Opción 1: Usar Docker (recomendado)
docker-compose up -d backend

# Opción 2: Instalar GDAL manualmente
# Windows: Descargar desde https://www.gisinternals.com/
# Linux: sudo apt-get install gdal-bin libgdal-dev
```

### Frontend no inicia
```bash
# Limpiar node_modules e instalar de nuevo
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Recursos

- **Documentación del Proyecto**: [PROJECT_PLAN.md](PROJECT_PLAN.md)
- **Checklist de Desarrollo**: [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)
- **Resumen de Configuración**: [SETUP_SUMMARY.md](SETUP_SUMMARY.md)
- **API Docs**: http://localhost:8000/docs (cuando el servidor esté corriendo)

---

## 🎯 Próximos Pasos

1. Completar configuración de migraciones
2. Implementar endpoints de autenticación
3. Crear componentes de UI
4. Desarrollar visor de mapas 2D

Ver [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md) para el plan completo.

---

**¡Listo para desarrollar! 🚀**
