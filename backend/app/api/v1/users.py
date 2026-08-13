from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.amenity import Amenity
from app.schemas.amenity import AmenityResponse

router = APIRouter(prefix="", tags=["General"])

@router.get("/amenities", response_model=List[AmenityResponse])
def get_all_amenities(db: Session = Depends(get_db)):
    amenities = db.query(Amenity).order_by(Amenity.name.asc()).all()
    return amenities
