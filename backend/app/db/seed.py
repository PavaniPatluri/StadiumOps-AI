"""Seed database with realistic mock data for StadiumOps AI."""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.models import (
    User, StadiumZone, ParkingLot, FoodCourt,
    Team, Fixture, Volunteer, Notification, UserRole
)
from app.core.security import get_password_hash


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_users(db: Session):
    users = [
        {"email": "admin@stadiumops.com", "username": "admin", "password": "admin123",
         "full_name": "System Administrator", "role": UserRole.ADMIN},
        {"email": "security@stadiumops.com", "username": "security", "password": "security123",
         "full_name": "Chief Security Officer", "role": UserRole.SECURITY},
        {"email": "medical@stadiumops.com", "username": "medical", "password": "medical123",
         "full_name": "Dr. Sarah Chen", "role": UserRole.MEDICAL},
        {"email": "ops@stadiumops.com", "username": "operations", "password": "ops123",
         "full_name": "Operations Manager", "role": UserRole.OPERATIONS},
        {"email": "volunteer@stadiumops.com", "username": "volunteer", "password": "vol123",
         "full_name": "Volunteer Coordinator", "role": UserRole.VOLUNTEER},
    ]
    for u in users:
        if not db.query(User).filter(User.username == u["username"]).first():
            user = User(
                email=u["email"],
                username=u["username"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            db.add(user)
    db.commit()


def seed_zones(db: Session):
    zones = [
        {"name": "North Stand", "zone_code": "NORTH", "capacity": 12000, "current_occupancy": 9360,
         "density_level": "yellow", "x_position": 25, "y_position": 5, "width": 50, "height": 15},
        {"name": "South Stand", "zone_code": "SOUTH", "capacity": 12000, "current_occupancy": 6240,
         "density_level": "green", "x_position": 25, "y_position": 80, "width": 50, "height": 15},
        {"name": "East Wing", "zone_code": "EAST", "capacity": 8000, "current_occupancy": 7520,
         "density_level": "red", "x_position": 75, "y_position": 30, "width": 20, "height": 40},
        {"name": "West Wing", "zone_code": "WEST", "capacity": 8000, "current_occupancy": 5680,
         "density_level": "yellow", "x_position": 5, "y_position": 30, "width": 20, "height": 40},
        {"name": "VIP Lounge", "zone_code": "VIP", "capacity": 3000, "current_occupancy": 1290,
         "density_level": "green", "x_position": 30, "y_position": 35, "width": 15, "height": 10},
        {"name": "Concourse A", "zone_code": "CONCOURSE_A", "capacity": 5000, "current_occupancy": 3400,
         "density_level": "yellow", "x_position": 10, "y_position": 20, "width": 15, "height": 12},
        {"name": "Concourse B", "zone_code": "CONCOURSE_B", "capacity": 5000, "current_occupancy": 2750,
         "density_level": "green", "x_position": 75, "y_position": 20, "width": 15, "height": 12},
        {"name": "Media Zone", "zone_code": "MEDIA", "capacity": 800, "current_occupancy": 240,
         "density_level": "green", "x_position": 42, "y_position": 20, "width": 16, "height": 8},
        {"name": "Field Area", "zone_code": "FIELD", "capacity": 500, "current_occupancy": 45,
         "density_level": "green", "x_position": 25, "y_position": 30, "width": 50, "height": 40},
    ]
    for z in zones:
        if not db.query(StadiumZone).filter(StadiumZone.zone_code == z["zone_code"]).first():
            db.add(StadiumZone(**z))
    db.commit()


def seed_parking(db: Session):
    lots = [
        {"name": "Lot A – VIP & Premium", "lot_code": "LOT_A", "total_spaces": 750, "occupied_spaces": 652,
         "reserved_spaces": 100, "ev_spaces": 50, "ev_occupied": 42,
         "distance_to_entrance": "2 min walk", "price_per_hour": 15.0},
        {"name": "Lot B – Main Entrance", "lot_code": "LOT_B", "total_spaces": 1200, "occupied_spaces": 744,
         "reserved_spaces": 120, "ev_spaces": 80, "ev_occupied": 56,
         "distance_to_entrance": "5 min walk", "price_per_hour": 10.0},
        {"name": "Lot C – East Side", "lot_code": "LOT_C", "total_spaces": 900, "occupied_spaces": 405,
         "reserved_spaces": 60, "ev_spaces": 40, "ev_occupied": 18,
         "distance_to_entrance": "8 min walk", "price_per_hour": 8.0},
        {"name": "Lot D – Remote (Shuttle)", "lot_code": "LOT_D", "total_spaces": 2000, "occupied_spaces": 460,
         "reserved_spaces": 0, "ev_spaces": 20, "ev_occupied": 5,
         "distance_to_entrance": "15 min shuttle", "price_per_hour": 5.0},
    ]
    for lot in lots:
        if not db.query(ParkingLot).filter(ParkingLot.lot_code == lot["lot_code"]).first():
            db.add(ParkingLot(**lot))
    db.commit()


def seed_food_courts(db: Session):
    courts = [
        {"name": "Zone A Grill & BBQ", "location": "North Stand Level 1", "vendor_count": 6, "current_queue": 145,
         "avg_wait_time": 22, "capacity": 300},
        {"name": "North Concession Stand", "location": "North Entrance", "vendor_count": 4, "current_queue": 80,
         "avg_wait_time": 12, "capacity": 200},
        {"name": "VIP Restaurant & Bar", "location": "VIP Lounge Level 2", "vendor_count": 3, "current_queue": 18,
         "avg_wait_time": 4, "capacity": 150},
        {"name": "East Snack Bar", "location": "East Wing Concourse", "vendor_count": 5, "current_queue": 110,
         "avg_wait_time": 18, "capacity": 250},
        {"name": "West Food Village", "location": "West Entrance Plaza", "vendor_count": 8, "current_queue": 62,
         "avg_wait_time": 9, "capacity": 400},
        {"name": "South Gate Refreshments", "location": "South Gate Area", "vendor_count": 3, "current_queue": 35,
         "avg_wait_time": 6, "capacity": 180},
    ]
    for c in courts:
        if not db.query(FoodCourt).filter(FoodCourt.name == c["name"]).first():
            db.add(FoodCourt(**c))
    db.commit()


def seed_teams(db: Session):
    teams_data = [
        {"name": "Team Alpha FC", "short_code": "ALP", "country": "USA", "group_name": "Group A",
         "wins": 2, "losses": 0, "draws": 1, "goals_for": 6, "goals_against": 2},
        {"name": "Delta United", "short_code": "DEL", "country": "Brazil", "group_name": "Group A",
         "wins": 1, "losses": 1, "draws": 1, "goals_for": 4, "goals_against": 4},
        {"name": "Striker FC", "short_code": "STR", "country": "Germany", "group_name": "Group A",
         "wins": 1, "losses": 1, "draws": 1, "goals_for": 3, "goals_against": 3},
        {"name": "Phoenix FC", "short_code": "PHX", "country": "Spain", "group_name": "Group A",
         "wins": 0, "losses": 2, "draws": 1, "goals_for": 2, "goals_against": 6},
        {"name": "Titan Athletic", "short_code": "TIT", "country": "France", "group_name": "Group B",
         "wins": 3, "losses": 0, "draws": 0, "goals_for": 8, "goals_against": 1},
        {"name": "Storm City SC", "short_code": "STM", "country": "Italy", "group_name": "Group B",
         "wins": 2, "losses": 1, "draws": 0, "goals_for": 5, "goals_against": 3},
        {"name": "Iron Eagles FC", "short_code": "IRN", "country": "England", "group_name": "Group B",
         "wins": 1, "losses": 2, "draws": 0, "goals_for": 3, "goals_against": 6},
        {"name": "Coastal Warriors", "short_code": "CST", "country": "Portugal", "group_name": "Group B",
         "wins": 0, "losses": 3, "draws": 0, "goals_for": 1, "goals_against": 7},
    ]
    for t in teams_data:
        if not db.query(Team).filter(Team.short_code == t["short_code"]).first():
            db.add(Team(**t))
    db.commit()


def seed_fixtures(db: Session):
    teams = {t.short_code: t for t in db.query(Team).all()}
    if not teams:
        return

    fixtures = [
        # Completed
        {"home": "ALP", "away": "DEL", "date": datetime.now() - timedelta(days=10),
         "home_score": 2, "away_score": 1, "status": "completed", "stage": "Group A",
         "venue": "Stadium North", "expected_attendance": 48000},
        {"home": "STR", "away": "PHX", "date": datetime.now() - timedelta(days=10),
         "home_score": 1, "away_score": 1, "status": "completed", "stage": "Group A",
         "venue": "Stadium South", "expected_attendance": 42000},
        {"home": "TIT", "away": "STM", "date": datetime.now() - timedelta(days=8),
         "home_score": 3, "away_score": 1, "status": "completed", "stage": "Group B",
         "venue": "Main Arena", "expected_attendance": 55000},
        {"home": "IRN", "away": "CST", "date": datetime.now() - timedelta(days=8),
         "home_score": 2, "away_score": 0, "status": "completed", "stage": "Group B",
         "venue": "East Arena", "expected_attendance": 38000},
        # Live
        {"home": "ALP", "away": "STR", "date": datetime.now() - timedelta(hours=1),
         "home_score": 1, "away_score": 0, "status": "live", "stage": "Group A",
         "venue": "Main Arena", "expected_attendance": 65000},
        # Upcoming
        {"home": "TIT", "away": "IRN", "date": datetime.now() + timedelta(days=2),
         "home_score": None, "away_score": None, "status": "scheduled", "stage": "Group B",
         "venue": "Stadium North", "expected_attendance": 58000},
        {"home": "DEL", "away": "PHX", "date": datetime.now() + timedelta(days=3),
         "home_score": None, "away_score": None, "status": "scheduled", "stage": "Group A",
         "venue": "Stadium South", "expected_attendance": 45000},
        {"home": "STM", "away": "CST", "date": datetime.now() + timedelta(days=5),
         "home_score": None, "away_score": None, "status": "scheduled", "stage": "Group B",
         "venue": "East Arena", "expected_attendance": 40000},
    ]

    if db.query(Fixture).count() == 0:
        for f in fixtures:
            home_team = teams.get(f["home"])
            away_team = teams.get(f["away"])
            if home_team and away_team:
                fixture = Fixture(
                    home_team_id=home_team.id,
                    away_team_id=away_team.id,
                    match_date=f["date"],
                    home_score=f.get("home_score"),
                    away_score=f.get("away_score"),
                    status=f["status"],
                    stage=f["stage"],
                    venue=f["venue"],
                    expected_attendance=f["expected_attendance"],
                )
                db.add(fixture)
    db.commit()


def seed_volunteers(db: Session):
    roles = ["Gate Manager", "Crowd Controller", "Medical Support", "Parking Guide",
             "Information Desk", "Security Assist", "First Aid", "VIP Host"]
    zones = ["North Stand", "South Stand", "East Wing", "West Wing", "VIP Lounge",
             "Concourse A", "Parking Lot A", "Main Entrance", "Gate B", "Gate C"]
    skills_pool = ["First Aid", "CPR", "Languages", "Crowd Control", "Communication",
                   "Parking Management", "Customer Service", "Security Protocol"]

    names = [
        "James Wilson", "Emma Davis", "Carlos Rodriguez", "Priya Patel", "Michael Johnson",
        "Sophie Turner", "Alex Kim", "Fatima Al-Hassan", "Ryan O'Brien", "Yuki Tanaka",
        "Marcus Brown", "Isabella Martinez", "David Lee", "Amara Osei", "Noah Taylor",
        "Zara Ahmed", "Liam Chen", "Olivia Scott", "Ethan Williams", "Mia Robinson",
    ]

    if db.query(Volunteer).count() == 0:
        for i, name in enumerate(names):
            shift_start = datetime.now().replace(hour=8, minute=0, second=0)
            shift_end = shift_start + timedelta(hours=8)
            skills = random.sample(skills_pool, k=random.randint(1, 3))
            db.add(Volunteer(
                name=name,
                email=f"{name.lower().replace(' ', '.')}@volunteer.com",
                phone=f"+1-555-{random.randint(1000, 9999)}",
                role=random.choice(roles),
                zone_assigned=random.choice(zones),
                shift_start=shift_start,
                shift_end=shift_end,
                is_available=random.choice([True, True, False]),
                skills=", ".join(skills),
                tasks_completed=random.randint(0, 15),
            ))
    db.commit()


def seed_notifications(db: Session):
    if db.query(Notification).count() == 0:
        notifications = [
            {"title": "🚨 Crowd Alert: East Wing", "message": "East Wing zone is at 94% capacity. Recommend redirecting fans to West Gate immediately.",
             "notification_type": "emergency", "target_role": "security"},
            {"title": "⚠️ Parking Lot A Near Full", "message": "Lot A is at 87% capacity. Expected to reach 100% within 35 minutes. Activate overflow routing to Lot C.",
             "notification_type": "warning", "target_role": "operations"},
            {"title": "🌡️ Heat Advisory", "message": "Stadium temperature reached 32°C. Additional water stations activated. Medical team on standby.",
             "notification_type": "warning", "target_role": "all"},
            {"title": "✅ Medical Incident Resolved", "message": "Medical incident at Section B-12 has been resolved. Patient transported to hospital.",
             "notification_type": "success", "target_role": "medical"},
            {"title": "🔴 Live Match Started", "message": "Team Alpha FC vs Striker FC has kicked off. Expected 65,000 attendees at peak.",
             "notification_type": "info", "target_role": "all"},
            {"title": "🍔 High Queue Alert: Zone A Grill", "message": "Zone A Grill has 22-minute wait time. Recommend opening backup counters.",
             "notification_type": "warning", "target_role": "operations"},
        ]
        for n in notifications:
            db.add(Notification(**n))
    db.commit()


def run_seed():
    create_tables()
    db = SessionLocal()
    try:
        print("Seeding users...")
        seed_users(db)
        print("Seeding zones...")
        seed_zones(db)
        print("Seeding parking...")
        seed_parking(db)
        print("Seeding food courts...")
        seed_food_courts(db)
        print("Seeding teams...")
        seed_teams(db)
        print("Seeding fixtures...")
        seed_fixtures(db)
        print("Seeding volunteers...")
        seed_volunteers(db)
        print("Seeding notifications...")
        seed_notifications(db)
        print("✅ Database seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
