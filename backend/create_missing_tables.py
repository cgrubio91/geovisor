from app.db_base import Base
from app.database import engine
# Import tables to ensure they are registered
from app.models import user, project, layer, measurement

def create_tables():
    print("Creating missing tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    create_tables()
