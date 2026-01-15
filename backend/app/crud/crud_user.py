from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from typing import Optional

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_access_code(db: Session, access_code: str):
    return db.query(User).filter(User.access_code == access_code).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    from app.models.project import Project
    obj_in = user.model_dump()
    project_ids = obj_in.pop("project_ids", [])
    
    db_user = User(
        email=obj_in.get("email"),
        full_name=obj_in.get("full_name"),
        access_code=obj_in.get("access_code"),
        is_active=obj_in.get("is_active", True),
        is_admin=obj_in.get("is_admin", False)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    if project_ids:
        projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
        db_user.projects.extend(projects)
        db.commit()
        db.refresh(db_user)
        
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    from app.models.project import Project
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle project assignment
    if "project_ids" in update_data:
        project_ids = update_data.pop("project_ids")
        if project_ids is not None:
            # Clear existing and add new
            db_user.projects = []
            projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
            db_user.projects.extend(projects)
            
    for field, value in update_data.items():
        setattr(db_user, field, value)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    # Depending on requirements, we might want to soft delete (set is_active=False)
    # or hard delete. Providing function for hard delete here.
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False
