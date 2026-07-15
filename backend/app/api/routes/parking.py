from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.models import ParkingLot
from app.schemas.schemas import ParkingLotOut
from app.services.ai_service import predict_parking_demand

router = APIRouter(prefix="/parking", tags=["Parking"])


@router.get("/", response_model=List[ParkingLotOut])
def list_parking(db: Session = Depends(get_db)):
    lots = db.query(ParkingLot).all()
    return [ParkingLotOut.from_orm_with_computed(lot) for lot in lots]


@router.get("/prediction")
def get_parking_prediction(match_importance: str = "high"):
    hour = datetime.now().hour
    day = datetime.now().weekday()
    prediction = predict_parking_demand(hour, day, match_importance)
    return prediction


@router.get("/stats")
def get_parking_stats(db: Session = Depends(get_db)):
    lots = db.query(ParkingLot).all()
    total = sum(l.total_spaces for l in lots)
    occupied = sum(l.occupied_spaces for l in lots)
    ev_total = sum(l.ev_spaces for l in lots)
    ev_occupied = sum(l.ev_occupied for l in lots)
    return {
        "total_spaces": total,
        "occupied_spaces": occupied,
        "available_spaces": total - occupied,
        "occupancy_percent": round((occupied / total) * 100, 1) if total else 0,
        "ev_total": ev_total,
        "ev_occupied": ev_occupied,
        "ev_available": ev_total - ev_occupied,
        "lots_count": len(lots),
        "full_lots": sum(1 for l in lots if l.occupied_spaces >= l.total_spaces * 0.95),
    }
