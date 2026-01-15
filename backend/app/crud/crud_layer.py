from sqlalchemy.orm import Session
from app.models.layer import Layer
from app.schemas.layer import LayerCreate, LayerUpdate


def get_layers(db: Session, project_id: int, skip: int = 0, limit: int = 100):
    """Retrieve a list of layers belonging to a project."""
    return (
        db.query(Layer)
        .filter(Layer.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_layer(db: Session, layer_id: int):
    """Retrieve a single layer by its ID."""
    return db.query(Layer).filter(Layer.id == layer_id).first()


def create_layer(db: Session, layer: LayerCreate):
    """Create a new layer record."""
    db_layer = Layer(**layer.dict())
    db.add(db_layer)
    db.commit()
    db.refresh(db_layer)
    return db_layer


def update_layer(db: Session, layer_id: int, layer_update: LayerUpdate):
    """Update an existing layer. Returns the updated object or None if not found."""
    db_layer = db.query(Layer).filter(Layer.id == layer_id).first()
    if not db_layer:
        return None
    update_data = layer_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_layer, key, value)
    db.commit()
    db.refresh(db_layer)
    return db_layer


def delete_layer(db: Session, layer_id: int):
    """Delete a layer by ID. Returns True if deleted, False otherwise."""
    db_layer = db.query(Layer).filter(Layer.id == layer_id).first()
    if not db_layer:
        return False
    db.delete(db_layer)
    db.commit()
    return True
