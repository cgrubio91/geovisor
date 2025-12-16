from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.config import settings

def init_db(db: Session) -> None:
    # Create superuser if it doesn't exist
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        user = User(
            username="admin",
            email=settings.FIRST_SUPERUSER_EMAIL, # admin@geovisor.com
            hashed_password=get_password_hash("admin123"), # admin123
            full_name="Administrator",
            role=UserRole.ADMIN,
            is_superuser=True,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created: {user.username} (password: {settings.FIRST_SUPERUSER_PASSWORD})")
    else:
        print("Admin user already exists")

def main() -> None:
    db = SessionLocal()
    init_db(db)

if __name__ == "__main__":
    main()
