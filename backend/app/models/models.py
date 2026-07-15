from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SECURITY = "security"
    MEDICAL = "medical"
    OPERATIONS = "operations"
    VOLUNTEER = "volunteer"


class IncidentType(str, enum.Enum):
    MEDICAL = "medical"
    SECURITY = "security"
    FIRE = "fire"
    LOST_CHILD = "lost_child"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VOLUNTEER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    incidents = relationship("Incident", back_populates="reporter")


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    incident_type = Column(Enum(IncidentType), nullable=False)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN)
    location = Column(String)
    zone = Column(String)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reporter = relationship("User", back_populates="incidents")
    ai_summary = Column(Text)
    ai_recommended_actions = Column(Text)
    ai_estimated_resolution = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))


class StadiumZone(Base):
    __tablename__ = "stadium_zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    zone_code = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, default=1000)
    current_occupancy = Column(Integer, default=0)
    density_level = Column(String, default="green")  # green, yellow, red
    x_position = Column(Float)
    y_position = Column(Float)
    width = Column(Float)
    height = Column(Float)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ParkingLot(Base):
    __tablename__ = "parking_lots"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lot_code = Column(String, unique=True)
    total_spaces = Column(Integer, default=500)
    occupied_spaces = Column(Integer, default=0)
    reserved_spaces = Column(Integer, default=50)
    ev_spaces = Column(Integer, default=20)
    ev_occupied = Column(Integer, default=0)
    distance_to_entrance = Column(String)
    price_per_hour = Column(Float, default=5.0)
    is_open = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class FoodCourt(Base):
    __tablename__ = "food_courts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    vendor_count = Column(Integer, default=5)
    current_queue = Column(Integer, default=0)
    avg_wait_time = Column(Integer, default=5)  # minutes
    capacity = Column(Integer, default=200)
    is_open = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_code = Column(String)
    country = Column(String)
    logo_url = Column(String)
    group_name = Column(String)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    goals_for = Column(Integer, default=0)
    goals_against = Column(Integer, default=0)


class Fixture(Base):
    __tablename__ = "fixtures"
    id = Column(Integer, primary_key=True, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"))
    away_team_id = Column(Integer, ForeignKey("teams.id"))
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    venue = Column(String)
    match_date = Column(DateTime(timezone=True))
    stage = Column(String)
    home_score = Column(Integer)
    away_score = Column(Integer)
    status = Column(String, default="scheduled")  # scheduled, live, completed
    expected_attendance = Column(Integer)


class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    role = Column(String)
    zone_assigned = Column(String)
    shift_start = Column(DateTime(timezone=True))
    shift_end = Column(DateTime(timezone=True))
    is_available = Column(Boolean, default=True)
    skills = Column(String)  # comma-separated
    tasks_completed = Column(Integer, default=0)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String)  # emergency, warning, info, success
    target_role = Column(String)  # all, admin, security, medical, etc.
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
