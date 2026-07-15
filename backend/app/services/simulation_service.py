"""Simulation service: generates realistic live data updates for demo purposes."""
import random
import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import StadiumZone, ParkingLot, FoodCourt


def simulate_zone_updates(db: Session):
    """Simulate realistic crowd movement in stadium zones."""
    zones = db.query(StadiumZone).all()
    hour = datetime.now().hour
    
    # Simulate crowd build-up based on time of day
    base_factor = _get_time_factor(hour)
    
    for zone in zones:
        # Add some random variation
        variation = random.uniform(-0.05, 0.05)
        target_pct = min(0.98, max(0.05, base_factor + variation + _zone_bias(zone.zone_code)))
        new_occupancy = int(zone.capacity * target_pct)
        zone.current_occupancy = new_occupancy
        
        # Update density level
        pct = new_occupancy / zone.capacity
        if pct >= 0.85:
            zone.density_level = "red"
        elif pct >= 0.65:
            zone.density_level = "yellow"
        else:
            zone.density_level = "green"
    
    db.commit()


def simulate_parking_updates(db: Session):
    """Simulate parking lot changes."""
    lots = db.query(ParkingLot).all()
    hour = datetime.now().hour
    base_factor = _get_time_factor(hour)
    
    for lot in lots:
        variation = random.uniform(-0.03, 0.08)
        target_pct = min(0.99, max(0.0, base_factor + variation))
        lot.occupied_spaces = int(lot.total_spaces * target_pct)
        lot.ev_occupied = int(lot.ev_spaces * min(1.0, target_pct + 0.1))
    
    db.commit()


def simulate_food_court_updates(db: Session):
    """Simulate food court queue updates."""
    courts = db.query(FoodCourt).all()
    hour = datetime.now().hour
    base_factor = _get_time_factor(hour)
    
    for court in courts:
        variation = random.uniform(-0.1, 0.15)
        queue_factor = min(1.0, max(0.0, base_factor + variation))
        court.current_queue = int(court.capacity * queue_factor * 0.4)
        court.avg_wait_time = max(2, int(court.current_queue * 0.3 + random.uniform(-2, 3)))
    
    db.commit()


def _get_time_factor(hour: int) -> float:
    """Return crowd density factor based on time."""
    # Peaks before and after match (typically 17:00-19:00)
    if 0 <= hour < 8:
        return 0.05
    elif 8 <= hour < 12:
        return 0.15 + (hour - 8) * 0.04
    elif 12 <= hour < 15:
        return 0.35
    elif 15 <= hour < 17:
        return 0.55 + (hour - 15) * 0.10
    elif 17 <= hour < 18:
        return 0.82
    elif 18 == hour:
        return 0.92  # match time peak
    elif 19 == hour:
        return 0.85
    elif 20 <= hour < 22:
        return 0.6 - (hour - 20) * 0.15
    else:
        return 0.1


def _zone_bias(zone_code: str) -> float:
    """Apply zone-specific bias to make it realistic."""
    biases = {
        "NORTH": 0.05,
        "SOUTH": -0.05,
        "EAST": 0.12,
        "WEST": 0.03,
        "VIP": -0.25,
        "CONCOURSE_A": 0.05,
        "CONCOURSE_B": -0.02,
        "MEDIA": -0.30,
        "FIELD": -0.50,
    }
    return biases.get(zone_code, 0.0)


def get_live_kpis(db: Session) -> dict:
    """Compute live KPI values from database."""
    zones = db.query(StadiumZone).all()
    parking_lots = db.query(ParkingLot).all()
    food_courts = db.query(FoodCourt).all()
    
    total_capacity = sum(z.capacity for z in zones) if zones else 65000
    total_attendance = sum(z.current_occupancy for z in zones) if zones else 45230
    
    total_parking = sum(p.total_spaces for p in parking_lots) if parking_lots else 3000
    occupied_parking = sum(p.occupied_spaces for p in parking_lots) if parking_lots else 1650
    available_parking = total_parking - occupied_parking
    
    avg_queue = (sum(f.avg_wait_time for f in food_courts) / len(food_courts)) if food_courts else 8.5
    
    hour = datetime.now().hour
    weather_data = _get_weather_simulation()
    
    return {
        "total_attendance": total_attendance,
        "capacity_percent": round((total_attendance / total_capacity) * 100, 1),
        "active_incidents": random.randint(2, 5),
        "resolved_incidents": random.randint(10, 20),
        "parking_available": available_parking,
        "parking_percent": round((occupied_parking / total_parking) * 100, 1),
        "avg_queue_time": round(avg_queue, 1),
        "weather_temp": weather_data["temp"],
        "weather_condition": weather_data["condition"],
        "weather_humidity": weather_data["humidity"],
        "active_volunteers": random.randint(145, 165),
        "revenue_today": round(random.uniform(185000, 225000), 2),
        "timestamp": datetime.utcnow(),
    }


def _get_weather_simulation() -> dict:
    conditions = [
        {"condition": "Partly Cloudy", "temp": 28.0, "humidity": 65},
        {"condition": "Sunny", "temp": 31.0, "humidity": 55},
        {"condition": "Overcast", "temp": 24.0, "humidity": 75},
        {"condition": "Light Rain", "temp": 22.0, "humidity": 85},
        {"condition": "Clear", "temp": 26.5, "humidity": 60},
    ]
    base = conditions[hash(str(datetime.now().date())) % len(conditions)]
    base["temp"] += random.uniform(-1, 1)
    return base
