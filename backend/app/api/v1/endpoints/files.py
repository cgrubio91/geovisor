from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Any
import shutil
import os
from pathlib import Path
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app import schemas
from app.crud import crud_layer

router = APIRouter()

# Define upload directory
UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("Datos") # Mapping to the user's existing Datos folder for import

@router.on_event("startup")
async def startup_event():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload", response_model=schemas.Layer)
async def upload_file(
    project_id: int = Form(...),
    file: UploadFile = File(...),
    layer_type: str = Form(None),
    db: Session = Depends(get_db)
) -> Any:
    # 1. Save file
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Determine layer type if not provided
    if not layer_type:
        ext = file_path.suffix.lower()
        if ext in ['.tif', '.tiff', '.geotiff']:
            layer_type = 'raster'
        elif ext in ['.las', '.laz']:
            layer_type = 'pointcloud'
        elif ext in ['.shp', '.geojson', '.kml', '.json']:
            layer_type = 'vector'
        else:
            layer_type = 'unknown'

    # 3. Create Layer record
    layer_in = schemas.LayerCreate(
        name=file.filename,
        layer_type=layer_type,
        format=file_path.suffix.replace('.', ''),
        file_path=str(file_path),
        project_id=project_id,
        metadata_info={"original_filename": file.filename, "size": os.path.getsize(file_path)}
    )
    
    return crud_layer.create_layer(db, layer=layer_in)

@router.get("/list-local", response_model=List[str])
def list_local_files():
    """List files in the local 'Datos' directory available for import."""
    # This assumes the app can access the 'Datos' folder relative to CWD or configured path
    # The user environment has 'Datos' in the root workspace.
    # Backend is in 'backend/'. So 'Datos' is '../Datos'.
    
    # Adjust path to find Datos relative to backend execution working directory
    # If running from backend root:
    possible_paths = [Path("../Datos"), Path("Datos"), Path(r"c:\Users\cgrub\OneDrive\Documents\geovisor-1\Datos")]
    
    found_files = []
    
    for path in possible_paths:
        if path.exists():
            for f in path.iterdir():
                if f.is_file():
                    found_files.append(str(f.name))
            break # Stop after finding the valid directory
            
    return found_files

@router.post("/import-local", response_model=schemas.Layer)
def import_local_file(
    filename: str,
    project_id: int,
    db: Session = Depends(get_db)
):
    """Import a file that already exists in the Datos folder."""
    # Logic to find the file
    possible_paths = [Path("../Datos"), Path("Datos"), Path(r"c:\Users\cgrub\OneDrive\Documents\geovisor-1\Datos")]
    target_path = None
    
    for path in possible_paths:
        p = path / filename
        if p.exists():
            target_path = p
            break
    
    if not target_path:
        raise HTTPException(status_code=404, detail="File not found in Datos folder")
        
    # Determine type
    ext = target_path.suffix.lower()
    layer_type = 'unknown'
    if ext in ['.tif', '.tiff', '.geotiff']:
        layer_type = 'raster'
    elif ext in ['.las', '.laz']:
        layer_type = 'pointcloud'
    elif ext in ['.shp', '.geojson', '.kml', '.json']:
        layer_type = 'vector'
        
    # Create Layer
    layer_in = schemas.LayerCreate(
        name=filename,
        layer_type=layer_type,
        format=ext.replace('.', ''),
        file_path=str(target_path),
        project_id=project_id,
        metadata_info={"source": "local_import", "size": os.path.getsize(target_path)}
    )
    
    return crud_layer.create_layer(db, layer=layer_in)
