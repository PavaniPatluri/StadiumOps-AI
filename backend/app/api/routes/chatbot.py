from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.schemas.schemas import ChatMessage, ChatResponse
from app.services.ai_service import chat_with_stadium_ai
from app.services.simulation_service import get_live_kpis

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])


@router.post("/chat", response_model=ChatResponse)
def chat(message: ChatMessage, db: Session = Depends(get_db)):
    context = get_live_kpis(db)
    response = chat_with_stadium_ai(message.message, context)
    return {"response": response, "timestamp": datetime.utcnow()}
