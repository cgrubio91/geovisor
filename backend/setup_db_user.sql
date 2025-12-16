-- Script para configurar la base de datos GeoVisor
-- Ejecutar con: psql -U postgres -f setup_db.sql

-- 1. Crear usuario (si no existe)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'geovisor_user') THEN

      CREATE ROLE geovisor_user LOGIN PASSWORD 'geovisor_password_2024';
   END IF;
END
$do$;

-- 2. Crear base de datos
-- Nota: Esto suele fallar si se ejecuta dentro de una transacción.
-- Mejor ejecutar manualmente: CREATE DATABASE geovisor OWNER geovisor_user;
-- Si estás usando psql, puedes intentar: \c postgres se encarga, pero aquí lo separaremos.

-- Asignar privilegios (por si la db ya existe)
GRANT ALL PRIVILEGES ON DATABASE geovisor TO geovisor_user;
