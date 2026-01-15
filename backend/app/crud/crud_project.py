from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()

def create_project(db: Session, project: ProjectCreate):
    obj_in_data = project.dict()
    # Remove user_ids if present, as it's not a column in Project
    user_ids = obj_in_data.pop("user_ids", [])
    
    db_project = Project(**obj_in_data)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # If there are user_ids, associate them (assuming many-to-many is set up or we use crud_user)
    # For now, we just ensure the Project is created. 
    # To properly associate, we would need to fetch users and add to db_project.users.
    # However, given the current scope/error, simply popping user_ids fixes the 500.
    # We will implement the association logic if the models support it.
    
    if user_ids:
        from app.models.user import User # Local import to avoid circular dependency
        users = db.query(User).filter(User.id.in_(user_ids)).all()
        db_project.users.extend(users)
        db.commit()
        db.refresh(db_project)

    return db_project

def update_project(db: Session, project_id: int, project: ProjectUpdate):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    
    update_data = project.dict(exclude_unset=True)
    user_ids = update_data.pop("user_ids", None)
    
    for field, value in update_data.items():
        setattr(db_project, field, value)

    if user_ids is not None:
        from app.models.user import User
        users = db.query(User).filter(User.id.in_(user_ids)).all()
        db_project.users = users # Replace existing associations

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
        
    db.delete(db_project)
    db.commit()
    return db_project
