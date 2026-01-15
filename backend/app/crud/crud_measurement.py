from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.measurement import Measurement
from app.schemas.measurement import MeasurementCreate, MeasurementUpdate
import json
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape, mapping

def get_measurements(db: Session, project_id: int, skip: int = 0, limit: int = 100):
    """Retrieve measurements for a given project with pagination."""
    db_measurements = (
        db.query(Measurement)
        .filter(Measurement.project_id == project_id)
        .all()
    )
    
    # Convert binary geometry to GeoJSON dict for each measurement
    results = []
    for m in db_measurements:
        m_dict = {
            "id": m.id,
            "name": m.name,
            "type": m.type,
            "value": m.value,
            "unit": m.unit,
            "project_id": m.project_id,
            "params": m.params,
            "notes": m.notes,
            "geometry": None
        }
        if m.geometry is not None:
            m_dict["geometry"] = mapping(to_shape(m.geometry))
        results.append(m_dict)
        
    return results


def get_measurement(db: Session, measurement_id: int):
    """Retrieve a single measurement by its ID."""
    m = db.query(Measurement).filter(Measurement.id == measurement_id).first()
    if not m:
        return None
        
    m_dict = {
        "id": m.id,
        "name": m.name,
        "type": m.type,
        "value": m.value,
        "unit": m.unit,
        "project_id": m.project_id,
        "params": m.params,
        "notes": m.notes,
        "geometry": None
    }
    if m.geometry is not None:
        m_dict["geometry"] = mapping(to_shape(m.geometry))
    return m_dict


def create_measurement(db: Session, measurement: MeasurementCreate):
    """Create a new measurement record."""
    data = measurement.dict()
    
    geojson_geom = data.pop('geometry', None)
    if geojson_geom:
        try:
            s_geom = shape(geojson_geom)
            data['geometry'] = from_shape(s_geom, srid=4326)
        except Exception as e:
            print(f"Error converting geometry: {e}")

    db_measurement = Measurement(**data)
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    
    # Return with geometry as dict
    return get_measurement(db, db_measurement.id)


def update_measurement(db: Session, measurement_id: int, measurement_update: MeasurementUpdate):
    """Update an existing measurement."""
    db_measurement = db.query(Measurement).filter(Measurement.id == measurement_id).first()
    if not db_measurement:
        return None
    update_data = measurement_update.dict(exclude_unset=True)
    
    if 'geometry' in update_data:
        geojson_geom = update_data.pop('geometry')
        if geojson_geom:
            try:
                s_geom = shape(geojson_geom)
                update_data['geometry'] = from_shape(s_geom, srid=4326)
            except Exception as e:
                print(f"Error converting geometry in update: {e}")

    for key, value in update_data.items():
        setattr(db_measurement, key, value)
        
    db.commit()
    db.refresh(db_measurement)
    return get_measurement(db, db_measurement.id)


def delete_measurement(db: Session, measurement_id: int):
    """Delete a measurement by ID."""
    db_measurement = db.query(Measurement).filter(Measurement.id == measurement_id).first()
    if not db_measurement:
        return False
    db.delete(db_measurement)
    db.commit()
    return True
