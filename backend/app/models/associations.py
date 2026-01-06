from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.base_class import Base

# Association table for User and Project many-to-many relationship
user_project_association = Table(
    'user_project_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('project.id'), primary_key=True)
)
