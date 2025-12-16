from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db_base import Base
import enum


class MeasurementType(str, enum.Enum):
    """Measurement types"""
    DISTANCE = "distance"
    AREA = "area"
    PERIMETER = "perimeter"
    VOLUME = "volume"
    ELEVATION_PROFILE = "elevation_profile"


class MeasurementUnit(str, enum.Enum):
    """Measurement units"""
    METERS = "meters"
    KILOMETERS = "kilometers"
    SQUARE_METERS = "square_meters"
    HECTARES = "hectares"
    CUBIC_METERS = "cubic_meters"


class Measurement(Base):
    """Measurement model"""
    __tablename__ = "measurements"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=True)
    measurement_type = Column(SQLEnum(MeasurementType), nullable=False)
    
    # Geometry (stored as WKT or GeoJSON)
    geometry = Column(Geometry(geometry_type='GEOMETRY', srid=4326), nullable=True)
    
    # Measurement value and unit
    value = Column(Float, nullable=False)
    unit = Column(SQLEnum(MeasurementUnit), nullable=False)
    
    # Additional data (e.g., elevation profile points)
    data = Column(JSON, nullable=True)
    
    # Metadata
    notes = Column(String(512), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="measurements")
    
    def __repr__(self):
        return f"<Measurement {self.measurement_type}: {self.value} {self.unit}>"
