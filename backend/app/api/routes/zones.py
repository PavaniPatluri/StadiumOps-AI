from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import StadiumZone
from app.schemas.schemas import ZoneOut, ZoneUpdate

router = APIRouter(prefix="/zones", tags=["Stadium Zones"])


@router.get("/", response_model=List[ZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(StadiumZone).all()


@router.get("/{zone_id}", response_model=ZoneOut)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(StadiumZone).filter(StadiumZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.patch("/{zone_id}", response_model=ZoneOut)
def update_zone(zone_id: int, update: ZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(StadiumZone).filter(StadiumZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    if update.current_occupancy is not None:
        zone.current_occupancy = update.current_occupancy
        pct = zone.current_occupancy / zone.capacity
        if pct >= 0.85:
            zone.density_level = "red"
        elif pct >= 0.65:
            zone.density_level = "yellow"
        else:
            zone.density_level = "green"
    db.commit()
    db.refresh(zone)
    return zone
