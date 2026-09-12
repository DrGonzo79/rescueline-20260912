import json
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, model_validator

app = FastAPI(title="RescueLine Call Triage API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
calls = json.loads((Path(__file__).resolve().parent.parent / "data/calls.json").read_text())


class CallRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    caller: str = Field(min_length=2, max_length=80)
    phone: str = Field(pattern=r"^[0-9+() .-]{7,24}$")
    intent: str = Field(min_length=3, max_length=120)
    summary: str = Field(min_length=10, max_length=1200)
    sentiment: Literal["frustrated", "neutral", "positive"]
    bot_confidence: float = Field(ge=0, le=1)
    estimated_value: int = Field(ge=0, le=1_000_000)
    requested_quote: bool
    after_hours: bool
    emergency_keywords: list[str] = Field(default_factory=lambda: ["burst", "flood", "leak", "no heat"])

    @model_validator(mode="after")
    def reject_blank_text(self):
        if not self.caller.strip() or not self.summary.strip():
            raise ValueError("blank_text_not_allowed")
        return self


def triage_call(item: CallRequest) -> dict:
    text = f"{item.intent} {item.summary}".lower()
    emergency = any(keyword.lower() in text for keyword in item.emergency_keywords)
    handled = item.bot_confidence >= 0.85 and item.sentiment == "positive" and not item.requested_quote
    lost = item.bot_confidence < 0.5 or item.sentiment == "frustrated"
    classification = "handled" if handled else ("lost" if lost else "follow-up")
    score = 12
    score += 35 if emergency else 0
    score += 18 if item.sentiment == "frustrated" else 0
    score += 14 if item.requested_quote else 0
    score += 10 if item.after_hours else 0
    score += min(20, round(item.estimated_value / 125))
    score -= 45 if handled else 0
    score = max(0, min(100, score))
    action = "callback" if emergency or item.sentiment == "frustrated" else ("quote" if item.requested_quote else ("none" if handled else "text"))
    urgency = "now" if score >= 70 else ("today" if score >= 40 else "monitor")
    reasons = [
        *( ["Emergency language detected"] if emergency else [] ),
        *( ["Caller frustration detected"] if item.sentiment == "frustrated" else [] ),
        *( ["Quote intent captured"] if item.requested_quote else [] ),
        *( ["Low bot confidence"] if item.bot_confidence < 0.5 else [] ),
        *( ["After-hours opportunity"] if item.after_hours else [] ),
    ]
    return {"classification": classification, "priorityScore": score, "urgency": urgency, "recommendedAction": action, "reasons": reasons or ["No rescue signal detected"], "disclaimer": "Deterministic demo rules; no live call, AI, CRM, message, or booking integration."}


@app.get("/health")
def health():
    return {"status": "ok", "mode": "demo", "source": "fictional_fixture"}


@app.get("/calls")
def list_calls():
    return calls


@app.post("/calls/triage")
def triage(request: CallRequest):
    return triage_call(request)
