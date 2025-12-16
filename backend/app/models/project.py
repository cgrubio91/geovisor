from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db_base import Base
import enum


class ProjectMemberRole(str, enum.Enum):
    """Project member roles"""
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"


class Project(Base):
    """Project model"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    owner = relationship("User") # Removed back_populates
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    layers = relationship("Layer", back_populates="project", cascade="all, delete-orphan")
    measurements = relationship("Measurement", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project {self.name}>"


class ProjectMember(Base):
    """Project member association table"""
    __tablename__ = "project_members"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(ProjectMemberRole), default=ProjectMemberRole.VIEWER, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User") # Removed back_populates
    
    def __repr__(self):
        return f"<ProjectMember project_id={self.project_id} user_id={self.user_id}>"
