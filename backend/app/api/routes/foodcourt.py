from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import FoodCourt
from app.schemas.schemas import FoodCourtOut

router = APIRouter(prefix="/foodcourt", tags=["Food Court"])


@router.get("/", response_model=List[FoodCourtOut])
def list_food_courts(db: Session = Depends(get_db)):
    return db.query(FoodCourt).all()


@router.get("/stats")
def get_food_stats(db: Session = Depends(get_db)):
    courts = db.query(FoodCourt).all()
    if not courts:
        return {}
    avg_wait = sum(c.avg_wait_time for c in courts) / len(courts)
    total_queue = sum(c.current_queue for c in courts)
    busiest = max(courts, key=lambda c: c.current_queue)
    quietest = min(courts, key=lambda c: c.current_queue)
    return {
        "average_wait_time": round(avg_wait, 1),
        "total_queue": total_queue,
        "busiest_court": busiest.name,
        "quietest_court": quietest.name,
        "open_courts": sum(1 for c in courts if c.is_open),
        "total_courts": len(courts),
    }


@router.get("/demand-forecast")
def get_demand_forecast():
    """AI-powered demand forecast for food courts."""
    import random
    from datetime import datetime
    hour = datetime.now().hour
    
    forecast = []
    for h in range(max(8, hour), min(23, hour + 6)):
        base_demand = _hour_demand(h)
        forecast.append({
            "time": f"{h:02d}:00",
            "predicted_queue": int(base_demand * random.uniform(0.9, 1.1)),
            "predicted_wait": int(base_demand * 0.15 * random.uniform(0.85, 1.15)),
            "recommended_staff": max(2, int(base_demand / 30)),
        })
    return {"forecast": forecast, "generated_at": datetime.utcnow()}


def _hour_demand(hour: int) -> float:
    demands = {8: 20, 9: 35, 10: 55, 11: 80, 12: 180, 13: 160, 14: 100,
               15: 90, 16: 120, 17: 160, 18: 200, 19: 190, 20: 150, 21: 100, 22: 60}
    return demands.get(hour, 50)
