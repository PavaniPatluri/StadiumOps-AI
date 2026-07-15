import google.generativeai as genai
from app.core.config import settings
from typing import Optional
import json

_model = None


def get_model():
    global _model
    if _model is None and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


def analyze_incident(title: str, description: str, incident_type: str, location: str) -> dict:
    """Use Gemini to analyze an incident and provide AI recommendations."""
    model = get_model()
    
    if not model:
        # Return mock data if no API key
        return _mock_incident_analysis(incident_type)

    prompt = f"""
You are an AI assistant for a smart stadium operations platform. Analyze this incident and provide structured recommendations.

Incident Title: {title}
Description: {description}
Type: {incident_type}
Location: {location or "Unknown location"}

Respond ONLY with valid JSON in this exact format:
{{
  "severity": "low|medium|high|critical",
  "summary": "2-3 sentence professional summary of the incident",
  "recommended_actions": "Numbered list of 3-5 specific recommended actions for stadium staff",
  "estimated_resolution": "Estimated time to resolve (e.g., '15-30 minutes', '1-2 hours')",
  "resources_needed": "List of resources or personnel needed"
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        return _mock_incident_analysis(incident_type)


def chat_with_stadium_ai(message: str, context: dict) -> str:
    """AI chatbot for stadium operators."""
    model = get_model()

    if not model:
        return _mock_chatbot_response(message, context)

    context_str = f"""
Current Stadium Status:
- Total Attendance: {context.get('attendance', 45230)} / {context.get('capacity', 65000)} ({context.get('capacity_pct', 69.6)}%)
- Active Incidents: {context.get('active_incidents', 3)}
- Parking Available: {context.get('parking_available', 1240)} spaces ({context.get('parking_pct', 45)}% occupied)
- Average Queue Time: {context.get('avg_queue', 8.5)} minutes
- Weather: {context.get('weather', '28°C, Partly Cloudy')}
- Active Volunteers: {context.get('volunteers', 156)}

Crowd Density by Zone:
- North Stand: {context.get('north_stand', 'Yellow - 78% capacity')}
- South Stand: {context.get('south_stand', 'Green - 52% capacity')}
- East Wing: {context.get('east_wing', 'Red - 94% capacity')}
- West Wing: {context.get('west_wing', 'Yellow - 71% capacity')}
- VIP Lounge: {context.get('vip', 'Green - 43% capacity')}
- Concourse A: {context.get('concourse_a', 'Yellow - 68% capacity')}

Recent Incidents: {context.get('recent_incidents', 'Medical emergency at Gate B, Crowd congestion at East Wing')}
"""

    prompt = f"""You are StadiumOps AI, an expert AI assistant for smart stadium operations. 
You help stadium operators, security teams, and staff manage operations efficiently.

{context_str}

User Question: {message}

Provide a helpful, concise, professional response. Be specific with numbers and actionable recommendations. 
Keep your response under 200 words and focus on practical stadium operations advice."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return _mock_chatbot_response(message, context)


def predict_parking_demand(hour: int, day_of_week: int, match_importance: str) -> dict:
    """AI prediction for parking demand."""
    model = get_model()

    if not model:
        return _mock_parking_prediction(hour)

    prompt = f"""
Predict parking demand for a stadium event:
- Time: {hour}:00
- Day: {'Weekend' if day_of_week >= 5 else 'Weekday'}
- Match Importance: {match_importance}

Return JSON:
{{
  "predicted_occupancy_pct": <number 0-100>,
  "peak_time": "<time range>",
  "recommendation": "<brief recommendation>",
  "expected_arrivals_per_hour": <number>
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return _mock_parking_prediction(hour)


def _mock_incident_analysis(incident_type: str) -> dict:
    mock_data = {
        "medical": {
            "severity": "high",
            "summary": "A medical emergency has been reported requiring immediate attention. The situation involves potential health risks to stadium attendees and demands rapid response from medical personnel.",
            "recommended_actions": "1. Dispatch nearest medical team immediately\n2. Clear area around affected person\n3. Contact emergency services if needed\n4. Document incident details\n5. Notify stadium management",
            "estimated_resolution": "15-45 minutes",
            "resources_needed": "Medical team, AED device, stretcher, ambulance standby"
        },
        "security": {
            "severity": "high",
            "summary": "A security incident has been detected requiring immediate intervention from security personnel. The situation poses potential risks to crowd safety and event integrity.",
            "recommended_actions": "1. Deploy nearest security team\n2. Establish a perimeter around the area\n3. Coordinate with police if required\n4. Review CCTV footage\n5. File incident report",
            "estimated_resolution": "20-60 minutes",
            "resources_needed": "Security team, CCTV access, police coordination if needed"
        },
        "fire": {
            "severity": "critical",
            "summary": "A fire-related incident has been reported at the stadium. This is a critical safety situation requiring immediate evacuation protocols and fire department notification.",
            "recommended_actions": "1. Activate fire alarm immediately\n2. Begin controlled evacuation of affected zone\n3. Contact fire department (911)\n4. Deploy fire suppression team\n5. Account for all personnel",
            "estimated_resolution": "30-90 minutes",
            "resources_needed": "Fire suppression team, fire extinguishers, evacuation personnel, fire department"
        },
        "lost_child": {
            "severity": "medium",
            "summary": "A lost child report has been filed. Immediate coordination between security and staff is required to locate and reunite the child with their guardian safely.",
            "recommended_actions": "1. Broadcast description over PA system\n2. Deploy volunteers to search area\n3. Bring child to family center\n4. Review CCTV footage of last known location\n5. Contact parents/guardians",
            "estimated_resolution": "10-30 minutes",
            "resources_needed": "Security personnel, PA system, family services area, CCTV team"
        },
        "maintenance": {
            "severity": "low",
            "summary": "A maintenance issue has been identified that requires attention to ensure continued safe and smooth stadium operations.",
            "recommended_actions": "1. Dispatch maintenance crew\n2. Cordon off affected area if unsafe\n3. Provide status update\n4. Arrange alternative facilities if needed\n5. Document repair work",
            "estimated_resolution": "30 minutes - 2 hours",
            "resources_needed": "Maintenance crew, tools, replacement parts"
        }
    }
    return mock_data.get(incident_type, mock_data["maintenance"])


def _mock_chatbot_response(message: str, context: dict) -> str:
    message_lower = message.lower()

    if "overcrowd" in message_lower or "crowd" in message_lower or "gate" in message_lower:
        return "Based on current sensor data, **East Wing** is the most overcrowded zone at 94% capacity (Red status). I recommend:\n\n1. Redirect incoming fans to **Gate A (West)** which is at 71% capacity\n2. Deploy 3 additional crowd control staff to East Wing\n3. Open overflow area near Section C-12\n4. Make PA announcement directing fans to less crowded gates\n\nEstimated time to reduce East Wing to Yellow status: ~25 minutes."

    elif "parking" in message_lower:
        return "Current parking status:\n\n- **Lot A (VIP)**: 87% full — only 91 spaces left\n- **Lot B (Main)**: 62% full — 285 spaces available\n- **Lot C (East)**: 45% full — 412 spaces available\n- **Lot D (Remote)**: 23% full — 581 spaces available\n\n**Recommendation**: Direct incoming vehicles to Lots C and D via the East entrance. Lot A will likely reach capacity in ~35 minutes at current arrival rate."

    elif "incident" in message_lower or "emergency" in message_lower:
        return "Today's incident summary:\n\n🔴 **3 Active Incidents**\n- Medical: Suspected heat exhaustion, Section B (HIGH priority)\n- Security: Unauthorized access attempt, Gate 7 (MEDIUM priority)\n- Maintenance: Blocked stairwell, East Concourse (LOW priority)\n\n✅ **12 Resolved Today** — Avg resolution time: 23 minutes\n\nAll critical incidents have been responded to. Medical team is on-scene for the heat exhaustion case."

    elif "weather" in message_lower:
        return "Current weather at the stadium:\n\n🌤 **28°C, Partly Cloudy**\n- Humidity: 65%\n- Wind: 12 km/h from SW\n- UV Index: 6 (High)\n\n⚠️ **Weather Alert**: Temperature expected to rise to 32°C in the next 2 hours. I recommend:\n1. Open additional water stations in exposed areas\n2. Activate cooling fans in South Stand\n3. Remind medical team about heat-related risk\n4. Make PA announcement about hydration"

    elif "volunteer" in message_lower or "staff" in message_lower:
        return "Current staff status:\n\n👥 **156 Active Volunteers** on shift\n- Gate Management: 34\n- Crowd Control: 45\n- Medical Support: 18\n- Parking: 28\n- Information Desks: 22\n- Float (available): 9\n\n**AI Recommendation**: Redeploy 4 float volunteers to East Wing crowd control given the current density levels. Shift change in 1.5 hours — ensure briefing covers East Wing congestion."

    elif "food" in message_lower or "queue" in message_lower:
        return "Food court status update:\n\n🍔 **Average wait time: 8.5 minutes**\n- **Zone A Grill**: 22 min wait (HIGH) ⚠️\n- **North Concession**: 12 min wait (MEDIUM)\n- **VIP Restaurant**: 4 min wait (LOW)\n- **East Snack Bar**: 18 min wait (HIGH) ⚠️\n\n**Recommendation**: Open backup counters at Zone A Grill and East Snack Bar. Consider deploying 2 additional staff. Announce Zone D food court (8 min wait) as an alternative via PA."

    elif "summar" in message_lower or "today" in message_lower or "operation" in message_lower:
        return "**Today's Operations Summary**\n\n📊 Attendance: 45,230 / 65,000 (69.6%)\n🚗 Parking: 55% occupied, 1,240 spaces available\n🍔 Avg Queue: 8.5 min\n🌡 Weather: 28°C, manageable conditions\n\n✅ **Operations Running Smoothly**\n- 3 active incidents (all being handled)\n- 12 incidents resolved today\n- No major disruptions\n- Crowd density normal in 4/6 zones\n\n⚠️ **Watch Points**: East Wing congestion, Zone A Grill queues, expected attendance spike in next 30 minutes (match kickoff)"

    else:
        return f"I'm StadiumOps AI, your intelligent stadium operations assistant. I can help you with:\n\n- **Crowd Management**: Zone density, gate capacity, flow optimization\n- **Incident Reports**: Status updates, recommendations, escalation\n- **Parking**: Availability, predictions, routing guidance\n- **Food Courts**: Queue times, demand forecasting\n- **Staff & Volunteers**: Deployment, task recommendations\n- **Weather**: Alerts and operational adjustments\n\nHow can I assist with today's operations?"


def _mock_parking_prediction(hour: int) -> dict:
    predictions = {
        range(0, 10): {"predicted_occupancy_pct": 15, "peak_time": "N/A", "recommendation": "Very low demand", "expected_arrivals_per_hour": 20},
        range(10, 14): {"predicted_occupancy_pct": 35, "peak_time": "12:00-14:00", "recommendation": "Normal operations", "expected_arrivals_per_hour": 80},
        range(14, 17): {"predicted_occupancy_pct": 65, "peak_time": "15:00-17:00", "recommendation": "Open extra staff at lots B and C", "expected_arrivals_per_hour": 180},
        range(17, 20): {"predicted_occupancy_pct": 88, "peak_time": "17:30-19:00", "recommendation": "Open Lot D overflow, direct traffic proactively", "expected_arrivals_per_hour": 320},
        range(20, 24): {"predicted_occupancy_pct": 72, "peak_time": "20:30-21:00", "recommendation": "Monitor exits, prepare for post-match surge", "expected_arrivals_per_hour": 150},
    }
    for r, pred in predictions.items():
        if hour in r:
            return pred
    return {"predicted_occupancy_pct": 50, "peak_time": "N/A", "recommendation": "Standard operations", "expected_arrivals_per_hour": 100}
