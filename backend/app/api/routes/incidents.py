from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Incident, IncidentStatus, IncidentSeverity
from app.schemas.schemas import IncidentCreate, IncidentOut, IncidentUpdate
from app.api.routes.auth import get_current_user
from app.models.models import User
from app.services.ai_service import analyze_incident

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=List[IncidentOut])
def list_incidents(
    status: Optional[str] = None,
    incident_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if incident_type:
        query = query.filter(Incident.incident_type == incident_type)
    return query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=IncidentOut)
def create_incident(
    incident_data: IncidentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        incident_type=incident_data.incident_type,
        location=incident_data.location,
        zone=incident_data.zone,
        reporter_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Run AI analysis
    background_tasks.add_task(_run_ai_analysis, incident.id, incident_data, db)
    return incident


def _run_ai_analysis(incident_id: int, incident_data: IncidentCreate, db: Session):
    from app.db.database import SessionLocal
    db2 = SessionLocal()
    try:
        incident = db2.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return
        ai_result = analyze_incident(
            title=incident_data.title,
            description=incident_data.description,
            incident_type=incident_data.incident_type.value,
            location=incident_data.location or "Unknown",
        )
        incident.ai_summary = ai_result.get("summary", "")
        incident.ai_recommended_actions = ai_result.get("recommended_actions", "")
        incident.ai_estimated_resolution = ai_result.get("estimated_resolution", "")
        severity_map = {"low": IncidentSeverity.LOW, "medium": IncidentSeverity.MEDIUM,
                        "high": IncidentSeverity.HIGH, "critical": IncidentSeverity.CRITICAL}
        incident.severity = severity_map.get(ai_result.get("severity", "medium"), IncidentSeverity.MEDIUM)
        incident.status = IncidentStatus.IN_PROGRESS
        db2.commit()
    finally:
        db2.close()


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(
    incident_id: int,
    update_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)
    if update_data.status == IncidentStatus.RESOLVED:
        from datetime import datetime
        incident.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"message": "Incident deleted"}
