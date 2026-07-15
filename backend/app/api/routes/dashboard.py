from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import DashboardKPI
from app.services.simulation_service import get_live_kpis, simulate_zone_updates, simulate_parking_updates, simulate_food_court_updates

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=DashboardKPI)
def get_kpis(db: Session = Depends(get_db)):
    # Trigger simulation updates
    simulate_zone_updates(db)
    simulate_parking_updates(db)
    simulate_food_court_updates(db)
    return get_live_kpis(db)


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Get analytics data for charts."""
    import random
    from datetime import datetime, timedelta
    
    # Hourly attendance data for today
    hours = list(range(8, 23))
    attendance_data = []
    cumulative = 0
    for h in hours:
        factor = _hour_factor(h)
        arriving = int(random.uniform(800, 1500) * factor)
        leaving = int(random.uniform(200, 600) * (1 - factor + 0.2))
        cumulative = min(65000, max(0, cumulative + arriving - leaving))
        attendance_data.append({
            "time": f"{h:02d}:00",
            "attendance": cumulative,
            "arrivals": arriving,
            "departures": leaving,
        })

    # Incidents by type
    incident_types = [
        {"type": "Medical", "count": random.randint(3, 8), "fill": "#ef4444"},
        {"type": "Security", "count": random.randint(2, 6), "fill": "#f97316"},
        {"type": "Maintenance", "count": random.randint(5, 12), "fill": "#eab308"},
        {"type": "Lost Child", "count": random.randint(1, 4), "fill": "#8b5cf6"},
        {"type": "Fire", "count": random.randint(0, 2), "fill": "#ec4899"},
    ]

    # Parking by lot
    parking_data = [
        {"name": "Lot A (VIP)", "occupied": 87, "available": 13},
        {"name": "Lot B (Main)", "occupied": 62, "available": 38},
        {"name": "Lot C (East)", "occupied": 45, "available": 55},
        {"name": "Lot D (Remote)", "occupied": 23, "available": 77},
    ]

    # Revenue by category
    revenue_data = [
        {"category": "Tickets", "amount": round(random.uniform(85000, 110000), 0)},
        {"category": "Food & Beverage", "amount": round(random.uniform(35000, 55000), 0)},
        {"category": "Parking", "amount": round(random.uniform(12000, 20000), 0)},
        {"category": "Merchandise", "amount": round(random.uniform(8000, 18000), 0)},
        {"category": "VIP", "amount": round(random.uniform(20000, 35000), 0)},
    ]

    # Crowd density over time
    density_trend = []
    for h in range(8, 23):
        f = _hour_factor(h)
        density_trend.append({
            "time": f"{h:02d}:00",
            "north": int(f * 100 * random.uniform(0.8, 1.1)),
            "south": int(f * 85 * random.uniform(0.7, 1.0)),
            "east": int(f * 110 * random.uniform(0.9, 1.2)),
            "west": int(f * 95 * random.uniform(0.8, 1.1)),
        })

    return {
        "attendance_trend": attendance_data,
        "incident_types": incident_types,
        "parking_utilization": parking_data,
        "revenue_breakdown": revenue_data,
        "crowd_density_trend": density_trend,
    }


def _hour_factor(hour: int) -> float:
    factors = {8: 0.1, 9: 0.15, 10: 0.2, 11: 0.28, 12: 0.35, 13: 0.42,
               14: 0.52, 15: 0.63, 16: 0.74, 17: 0.85, 18: 0.95, 19: 0.88,
               20: 0.75, 21: 0.60, 22: 0.45}
    return factors.get(hour, 0.5)
