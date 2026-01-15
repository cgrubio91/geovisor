from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine
from app.models.user import User
from app.models.project import Project
from app.models.layer import Layer
from app.models.measurement import Measurement
from app.models.associations import user_project_association
from app.models.infrastructure import WorkMilestone, InfrastructureElement, TraceabilityLog

def init_db(db: Session) -> None:
    # Ensure PostGIS extension exists
    from sqlalchemy import text
    db.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Check if admin user exists
    admin_user = db.query(User).filter(User.access_code == "ADMIN001").first()
    if not admin_user:
        admin_user = User(
            full_name="Administrador",
            access_code="ADMIN001",
            is_admin=True
        )
        db.add(admin_user)
    
    user1 = db.query(User).filter(User.access_code == "USER001").first()
    if not user1:
        user1 = User(
            full_name="Juan Pérez",
            access_code="USER001",
            is_admin=False
        )
        db.add(user1)

    user2 = db.query(User).filter(User.access_code == "USER002").first()
    if not user2:
        user2 = User(
            full_name="María González",
            access_code="USER002",
            is_admin=False
        )
        db.add(user2)
        
    db.commit() # Commit users so they have IDs
    
    # Check if projects exist
    if not db.query(Project).first():
        p1 = Project(
            name="Proyecto Carretera Norte",
            description="Levantamiento topográfico carretera norte - Km 0+000 a Km 15+500",
            location="Norte",
            status="Activo"
        )
        p2 = Project(
            name="Urbanización El Bosque",
            description="Proyecto de urbanización - 120 hectáreas",
            location="El Bosque",
            status="Activo"
        )
        p3 = Project(
            name="Minería Santa Rita",
            description="Cálculo de volúmenes de extracción",
            location="Santa Rita",
            status="Activo"
        )
        
        # Assign users to projects
        p1.users.append(admin_user)
        p1.users.append(user1)
        
        p2.users.append(admin_user)
        p2.users.append(user1)
        p2.users.append(user2)
        
        p3.users.append(admin_user)
        p3.users.append(user2)
        
        db.add_all([p1, p2, p3])
        
    db.commit()

if __name__ == "__main__":
    from app.db.session import SessionLocal
    db = SessionLocal()
    init_db(db)
    print("Database initialized!")
