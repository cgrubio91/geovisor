from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base
from app.models.associations import user_project_association

class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    stage = Column(String, default="Planificación") # Ej: Planificación, Ejecución, Finalizado
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")
    
    layers = relationship("Layer", back_populates="project", cascade="all, delete-orphan")
    measurements = relationship("Measurement", back_populates="project", cascade="all, delete-orphan")
    users = relationship("User", secondary=user_project_association, back_populates="projects")
