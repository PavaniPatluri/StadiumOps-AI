from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, dashboard, incidents, zones, parking, foodcourt, tournament, volunteers, chatbot, notifications

app = FastAPI(
    title="StadiumOps AI",
    description="AI-Powered Smart Stadium & Tournament Operations Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(zones.router, prefix="/api")
app.include_router(parking.router, prefix="/api")
app.include_router(foodcourt.router, prefix="/api")
app.include_router(tournament.router, prefix="/api")
app.include_router(volunteers.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "StadiumOps AI – Smart Stadium Operations Platform",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "StadiumOps AI Backend"}
