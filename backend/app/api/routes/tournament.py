from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models.models import Team, Fixture
from app.schemas.schemas import TeamOut, FixtureOut

router = APIRouter(prefix="/tournament", tags=["Tournament"])


@router.get("/teams", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    result = []
    for t in teams:
        data = TeamOut.from_orm(t)
        data.points = t.wins * 3 + t.draws
        result.append(data)
    return result


@router.get("/fixtures", response_model=List[FixtureOut])
def list_fixtures(
    status: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(Fixture).options(
        joinedload(Fixture.home_team),
        joinedload(Fixture.away_team)
    )
    if status:
        query = query.filter(Fixture.status == status)
    return query.order_by(Fixture.match_date).all()


@router.get("/standings")
def get_standings(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    standings = []
    for t in teams:
        gd = t.goals_for - t.goals_against
        standings.append({
            "id": t.id,
            "name": t.name,
            "short_code": t.short_code,
            "group": t.group_name,
            "played": t.wins + t.losses + t.draws,
            "wins": t.wins,
            "draws": t.draws,
            "losses": t.losses,
            "goals_for": t.goals_for,
            "goals_against": t.goals_against,
            "goal_difference": gd,
            "points": t.wins * 3 + t.draws,
        })
    standings.sort(key=lambda x: (-x["points"], -x["goal_difference"], -x["goals_for"]))
    return {"standings": standings}


@router.get("/live")
def get_live_matches(db: Session = Depends(get_db)):
    fixtures = db.query(Fixture).options(
        joinedload(Fixture.home_team),
        joinedload(Fixture.away_team)
    ).filter(Fixture.status == "live").all()
    return [FixtureOut.from_orm(f) for f in fixtures]
