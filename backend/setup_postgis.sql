-- Conectarse a la base de datos geovisor antes de ejecutar esto
-- psql -U postgres -d geovisor -f setup_postgis.sql

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
-- Opcional, para funciones avanzadas raster
-- CREATE EXTENSION IF NOT EXISTS postgis_raster; 
