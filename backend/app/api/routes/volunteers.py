from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Volunteer
from app.schemas.schemas import VolunteerOut

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.get("/", response_model=List[VolunteerOut])
def list_volunteers(
    zone: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Volunteer)
    if zone:
        query = query.filter(Volunteer.zone_assigned == zone)
    if available_only:
        query = query.filter(Volunteer.is_available == True)
    return query.all()


@router.get("/stats")
def get_volunteer_stats(db: Session = Depends(get_db)):
    volunteers = db.query(Volunteer).all()
    by_zone = {}
    by_role = {}
    for v in volunteers:
        zone = v.zone_assigned or "Unassigned"
        by_zone[zone] = by_zone.get(zone, 0) + 1
        role = v.role or "General"
        by_role[role] = by_role.get(role, 0) + 1
    return {
        "total": len(volunteers),
        "available": sum(1 for v in volunteers if v.is_available),
        "on_duty": sum(1 for v in volunteers if not v.is_available),
        "by_zone": [{"zone": k, "count": v} for k, v in by_zone.items()],
        "by_role": [{"role": k, "count": v} for k, v in by_role.items()],
        "avg_tasks_completed": round(sum(v.tasks_completed for v in volunteers) / len(volunteers), 1) if volunteers else 0,
    }


@router.get("/ai-tasks")
def get_ai_task_recommendations():
    """AI-generated task recommendations for volunteer deployment."""
    return {
        "recommendations": [
            {
                "priority": "HIGH",
                "zone": "East Wing",
                "task": "Crowd flow management - redirect fans to West Gate",
                "volunteers_needed": 4,
                "reason": "Current density at 94% capacity, risk of overcrowding"
            },
            {
                "priority": "MEDIUM",
                "zone": "Food Court Zone A",
                "task": "Queue management and line formation assistance",
                "volunteers_needed": 2,
                "reason": "Average wait time 22 minutes, exceeds 15-minute target"
            },
            {
                "priority": "MEDIUM",
                "zone": "Parking Lot A",
                "task": "Direct vehicles to available spaces in Lot C/D",
                "volunteers_needed": 3,
                "reason": "Lot A at 87% capacity, overflow expected in 35 minutes"
            },
            {
                "priority": "LOW",
                "zone": "North Stand",
                "task": "Fan assistance and information requests",
                "volunteers_needed": 2,
                "reason": "Scheduled shift reinforcement, pre-match activity high"
            },
            {
                "priority": "LOW",
                "zone": "Gate B",
                "task": "Entry flow assistance and ticket scanning support",
                "volunteers_needed": 2,
                "reason": "Steady arrival stream, additional support beneficial"
            }
        ],
        "available_volunteers": 9,
        "generated_at": "2026-07-15T18:00:00Z"
    }
