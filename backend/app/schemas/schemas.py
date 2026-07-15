from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, IncidentType, IncidentSeverity, IncidentStatus


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


class TokenData(BaseModel):
    username: Optional[str] = None


# User
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    role: UserRole = UserRole.VOLUNTEER


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


# Incidents
class IncidentCreate(BaseModel):
    title: str
    description: str
    incident_type: IncidentType
    location: Optional[str] = None
    zone: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[IncidentSeverity] = None
    ai_summary: Optional[str] = None
    ai_recommended_actions: Optional[str] = None
    ai_estimated_resolution: Optional[str] = None


class IncidentOut(BaseModel):
    id: int
    title: str
    description: str
    incident_type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus
    location: Optional[str]
    zone: Optional[str]
    reporter_id: Optional[int]
    ai_summary: Optional[str]
    ai_recommended_actions: Optional[str]
    ai_estimated_resolution: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Stadium Zone
class ZoneOut(BaseModel):
    id: int
    name: str
    zone_code: str
    capacity: int
    current_occupancy: int
    density_level: str
    x_position: Optional[float]
    y_position: Optional[float]
    width: Optional[float]
    height: Optional[float]
    updated_at: datetime

    class Config:
        from_attributes = True


class ZoneUpdate(BaseModel):
    current_occupancy: Optional[int] = None
    density_level: Optional[str] = None


# Parking
class ParkingLotOut(BaseModel):
    id: int
    name: str
    lot_code: Optional[str]
    total_spaces: int
    occupied_spaces: int
    reserved_spaces: int
    ev_spaces: int
    ev_occupied: int
    distance_to_entrance: Optional[str]
    price_per_hour: float
    is_open: bool
    occupancy_percent: float
    available_spaces: int

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_computed(cls, lot):
        data = {
            "id": lot.id,
            "name": lot.name,
            "lot_code": lot.lot_code,
            "total_spaces": lot.total_spaces,
            "occupied_spaces": lot.occupied_spaces,
            "reserved_spaces": lot.reserved_spaces,
            "ev_spaces": lot.ev_spaces,
            "ev_occupied": lot.ev_occupied,
            "distance_to_entrance": lot.distance_to_entrance,
            "price_per_hour": lot.price_per_hour,
            "is_open": lot.is_open,
            "occupancy_percent": round((lot.occupied_spaces / lot.total_spaces) * 100, 1) if lot.total_spaces else 0,
            "available_spaces": lot.total_spaces - lot.occupied_spaces,
        }
        return cls(**data)


# Food Court
class FoodCourtOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    vendor_count: int
    current_queue: int
    avg_wait_time: int
    capacity: int
    is_open: bool

    class Config:
        from_attributes = True


# Teams & Fixtures
class TeamOut(BaseModel):
    id: int
    name: str
    short_code: Optional[str]
    country: Optional[str]
    logo_url: Optional[str]
    group_name: Optional[str]
    wins: int
    losses: int
    draws: int
    goals_for: int
    goals_against: int
    points: int = 0

    class Config:
        from_attributes = True

    @property
    def computed_points(self):
        return self.wins * 3 + self.draws


class FixtureOut(BaseModel):
    id: int
    venue: Optional[str]
    match_date: Optional[datetime]
    stage: Optional[str]
    home_score: Optional[int]
    away_score: Optional[int]
    status: str
    expected_attendance: Optional[int]
    home_team: Optional[TeamOut]
    away_team: Optional[TeamOut]

    class Config:
        from_attributes = True


# Volunteer
class VolunteerOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    role: Optional[str]
    zone_assigned: Optional[str]
    shift_start: Optional[datetime]
    shift_end: Optional[datetime]
    is_available: bool
    skills: Optional[str]
    tasks_completed: int

    class Config:
        from_attributes = True


# Notification
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    target_role: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    target_role: str = "all"


# Dashboard KPIs
class DashboardKPI(BaseModel):
    total_attendance: int
    capacity_percent: float
    active_incidents: int
    resolved_incidents: int
    parking_available: int
    parking_percent: float
    avg_queue_time: float
    weather_temp: float
    weather_condition: str
    weather_humidity: int
    active_volunteers: int
    revenue_today: float
    timestamp: datetime


# AI Chatbot
class ChatMessage(BaseModel):
    message: str
    role: str = "user"


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime


Token.model_rebuild()
