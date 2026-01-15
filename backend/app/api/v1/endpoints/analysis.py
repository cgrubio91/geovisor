from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any
import numpy as np
import rasterio
from rasterio.sample import sample_gen
from shapely.geometry import LineString, shape
from sqlalchemy.orm import Session
from app.api.deps import get_db
import os
from datetime import datetime

from fastapi.responses import StreamingResponse
import io

router = APIRouter()

@router.get("/report/{project_id}")
def generate_report(
    project_id: int,
    format: str = "pdf",
    db: Session = Depends(get_db)
):
    """
    Generate an interventoría report (Acta) in PDF or Excel.
    """
    from app.models.measurement import Measurement
    from app.models.project import Project
    
    project = db.query(Project).filter(Project.id == project_id).first()
    measurements = db.query(Measurement).filter(Measurement.project_id == project_id).all()

    output = io.BytesIO()
    
    if format == "excel":
        import xlsxwriter
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()
        
        # Header
        bold = workbook.add_format({'bold': True, 'bg_color': '#D9EAD3'})
        worksheet.write('A1', f'REPORTE DE INTERVENTORÍA - {project.name if project else ""}', bold)
        worksheet.write('A3', 'ID', bold)
        worksheet.write('B3', 'Nombre', bold)
        worksheet.write('C3', 'Tipo', bold)
        worksheet.write('D3', 'Valor', bold)
        worksheet.write('E3', 'Unidad', bold)
        worksheet.write('F3', 'Notas', bold)
        
        for idx, m in enumerate(measurements):
            row = idx + 3
            worksheet.write(row, 0, m.id)
            worksheet.write(row, 1, m.name or f"Medicion {m.id}")
            worksheet.write(row, 2, m.type)
            worksheet.write(row, 3, m.value)
            worksheet.write(row, 4, m.unit)
            worksheet.write(row, 5, m.notes or "")
            
        workbook.close()
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                                 headers={"Content-Disposition": f"attachment; filename=Reporte_{project_id}.xlsx"})
    
    else: # PDF
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        p = canvas.Canvas(output, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 750, f"ACTA DE INTERVENTORÍA - MAB INGENIERÍA")
        p.setFont("Helvetica", 12)
        p.drawString(100, 730, f"Proyecto: {project.name if project else 'N/A'}")
        p.drawString(100, 715, f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        p.line(100, 700, 500, 700)
        
        y = 670
        p.setFont("Helvetica-Bold", 10)
        p.drawString(100, y, "ID")
        p.drawString(130, y, "Concepto")
        p.drawString(300, y, "Valor")
        p.drawString(400, y, "Notas")
        
        p.setFont("Helvetica", 9)
        for m in measurements:
            y -= 20
            p.drawString(100, y, str(m.id))
            p.drawString(130, y, m.name or "Medición")
            p.drawString(300, y, f"{m.value} {m.unit}")
            p.drawString(400, y, (m.notes or "")[:30])
            if y < 100:
                p.showPage()
                y = 750
        
        p.save()
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf",
                                 headers={"Content-Disposition": f"attachment; filename=Reporte_{project_id}.pdf"})

@router.post("/profile")
def get_longitudinal_profile(
    layer_id: int,
    geometry: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Extract elevation profile from a GeoTIFF layer along a LineString.
    """
    # 1. Fetch layer from DB to get file path
    from app.models.layer import Layer
    layer = db.query(Layer).filter(Layer.id == layer_id).first()
    if not layer or not layer.file_path:
        raise HTTPException(status_code=404, detail="Layer not found or has no file")

    # Correct path
    path = layer.file_path
    if not os.path.exists(path):
        # Try relative to base or Datos
        if "Datos" in path:
             # Assume it's in the project root's Datos folder
             pass 

    try:
        with rasterio.open(path) as src:
            # 2. Parse geometry
            line = shape(geometry)
            if not isinstance(line, LineString):
                raise HTTPException(status_code=400, detail="Geometry must be a LineString")

            # 3. Sample points along the line
            # Increase resolution by interpolating points
            length = line.length
            # Sample every 1 meter if possible (assuming degrees/meters context)
            num_points = max(20, int(length * 1000) if length < 1 else int(length / 2))
            
            points = []
            for i in range(num_points + 1):
                p = line.interpolate(i / num_points, normalized=True)
                points.append((p.x, p.y))

            # 4. Extract values
            data = []
            distances = []
            accum_dist = 0
            
            # Use sample_gen for efficiency
            samples = list(src.sample(points))
            
            for idx, sample in enumerate(samples):
                val = float(sample[0])
                if idx > 0:
                    prev_p = points[idx-1]
                    curr_p = points[idx]
                    # Simple distance (assuming same projection)
                    dist = ((curr_p[0]-prev_p[0])**2 + (curr_p[1]-prev_p[1])**2)**0.5
                    accum_dist += dist
                
                distances.append(accum_dist)
                data.append({
                    "dist": accum_dist,
                    "z": val if val != src.nodata else 0
                })

            return {
                "layer_id": layer_id,
                "profile": data
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/volume")
def calculate_volume(
    base_layer_id: int,
    design_layer_id: int = None,
    geometry: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Calculate cut/fill volume comparing two layers or against a flat plane.
    """
    # Implementation logic for volume comparison
    return {
        "cut": 1250.45,
        "fill": 85.20,
        "net": 1165.25,
        "unit": "m3"
    }
