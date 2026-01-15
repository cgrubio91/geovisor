from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from app.db.base_class import Base

class Measurement(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    type = Column(String) # distance, area, volume
    value = Column(Float) # calculated result
    unit = Column(String) # m, m2, m3
    geometry = Column(Geometry('GEOMETRY', srid=4326))
    params = Column(JSON, nullable=True) # To store colors, thickness, etc.
    notes = Column(String, nullable=True) # User annotations
    created_at = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("project.id"))
    
    project = relationship("Project", back_populates="measurements")
