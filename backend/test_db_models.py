import traceback
from app.database import engine
from app.db_base import Base
# Import all models to register them
from app.models import user, project #, layer, measurement
    
try:
    print("Creating tables directly with engine...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully via create_all()!")
except Exception:
    with open("create_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("❌ Error creating tables. See create_error.txt")
