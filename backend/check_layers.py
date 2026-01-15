from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text('SELECT id, name, file_path, format FROM layer'))
    print('ID | Name | Path | Format')
    for r in result:
        print(f'{r[0]} | {r[1]} | {r[2]} | {r[3]}')

print("\nChecking filesystem:")
potential_paths = ["uploads", "Datos", "../Datos"]
for dp in potential_paths:
    if os.path.exists(dp):
        print(f"\nContents of {dp}:")
        files = os.listdir(dp)
        for f in files[:10]: # limit to 10
            print(f" - {f}")
        if len(files) > 10:
            print(f" ... and {len(files)-10} more")
    else:
        print(f"\n{dp} does not exist")
