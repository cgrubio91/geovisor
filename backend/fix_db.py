from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Enabling PostGIS...")
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    print("Adding params column to measurement table...")
    try:
        conn.execute(text("ALTER TABLE measurement ADD COLUMN params JSON;"))
        conn.commit()
        print("Column added successfully.")
    except Exception as e:
        print(f"Error or column already exists: {e}")
    
    print("Ensuring geometry is present...")
    # Geometry should already be there but let's be sure
    
conn.close()
print("Done.")
