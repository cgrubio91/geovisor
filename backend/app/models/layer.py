from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db_base import Base
import enum


class LayerType(str, enum.Enum):
    """Layer types"""
    VECTOR = "vector"
    RASTER = "raster"
    POINT_CLOUD = "point_cloud"
    MODEL_3D = "model_3d"


class LayerFormat(str, enum.Enum):
    """Layer file formats"""
    KML = "kml"
    KMZ = "kmz"
    GEOJSON = "geojson"
    SHAPEFILE = "shapefile"
    GEOTIFF = "geotiff"
    LAS = "las"
    LAZ = "laz"
    GLTF = "gltf"
    IFC = "ifc"


class Layer(Base):
    """Layer model for geospatial data"""
    __tablename__ = "layers"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    layer_type = Column(SQLEnum(LayerType), nullable=False)
    format = Column(SQLEnum(LayerFormat), nullable=False)
    
    # File information
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    original_filename = Column(String(255), nullable=True)
    
    # Processed data paths
    processed_path = Column(String(512), nullable=True)  # GeoJSON, tiles, etc.
    thumbnail_path = Column(String(512), nullable=True)
    
    # Spatial metadata
    bbox = Column(JSON, nullable=True)  # Bounding box [minx, miny, maxx, maxy]
    crs = Column(String(50), nullable=True)  # Coordinate Reference System (EPSG code)
    
    # Additional metadata
    layer_metadata = Column(JSON, nullable=True)
    
    # Styling
    style = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="layers")
    
    def __repr__(self):
        return f"<Layer {self.name} ({self.layer_type})>"
