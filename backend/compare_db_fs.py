import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))

with engine.connect() as conn:
    layers = conn.execute(text('SELECT name, file_path FROM layer'))
    print("Database contents (Layer table):")
    for name, path in layers:
        print(f" Name: {name}")
        print(f" Path: {path}")

print("\nFiles in 'uploads':")
for f in os.listdir("uploads"):
    print(f" - {f}")
