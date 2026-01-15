from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from app.db.base_class import Base

class WorkMilestone(Base):
    """
    Hitos de obra: Puntos de control georreferenciados con evidencia fotográfica.
    """
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    location = Column(Geometry('POINT', srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("project.id"))
    
    project = relationship("Project", backref="milestones")

class InfrastructureElement(Base):
    """
    Elementos de infraestructura: Ejes viales, áreas de influencia, etc.
    """
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String) # Eje vial, Talud, Estructura
    geometry = Column(Geometry('GEOMETRY', srid=4326))
    properties = Column(JSON, nullable=True) # Metadata técnica
    project_id = Column(Integer, ForeignKey("project.id"))
    
    project = relationship("Project", backref="infrastructure_elements")

class TraceabilityLog(Base):
    """
    Bitácora de trazabilidad: Quién cargó los datos, cuándo se procesaron.
    """
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_id = Column(Integer, ForeignKey("user.id"))
    project_id = Column(Integer, ForeignKey("project.id"))
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
