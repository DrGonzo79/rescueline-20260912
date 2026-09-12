from fastapi.testclient import TestClient
import pytest

from main import app

client = TestClient(app)
BASE = {"caller":"Maya R.","phone":"(555) 014-2048","intent":"Emergency repair","summary":"Basement pipe burst; the bot looped and caller hung up.","sentiment":"frustrated","bot_confidence":0.31,"estimated_value":1250,"requested_quote":False,"after_hours":False}


def test_emergency_is_lost_and_callback_now():
    response = client.post("/calls/triage", json=BASE)
    assert response.status_code == 200
    assert response.json() == {"classification":"lost","priorityScore":75,"urgency":"now","recommendedAction":"callback","reasons":["Emergency language detected","Caller frustration detected","Low bot confidence"],"disclaimer":"Deterministic demo rules; no live call, AI, CRM, message, or booking integration."}


def test_handled_call_is_not_requeued():
    result = client.post("/calls/triage", json={**BASE,"intent":"Confirm appointment","summary":"Caller confirmed Tuesday and received the full arrival window.","sentiment":"positive","bot_confidence":0.94,"estimated_value":0}).json()
    assert result["classification"] == "handled"
    assert result["priorityScore"] == 0
    assert result["recommendedAction"] == "none"


def test_quote_and_after_hours_raise_priority():
    regular = client.post("/calls/triage", json={**BASE,"intent":"Drain cleaning","summary":"Caller requested a price and left valid contact details.","sentiment":"neutral","bot_confidence":0.6,"estimated_value":325,"requested_quote":True}).json()
    after_hours = client.post("/calls/triage", json={**BASE,"intent":"Drain cleaning","summary":"Caller requested a price and left valid contact details.","sentiment":"neutral","bot_confidence":0.6,"estimated_value":325,"requested_quote":True,"after_hours":True}).json()
    assert regular["classification"] == "follow-up"
    assert after_hours["priorityScore"] == regular["priorityScore"] + 10
    assert after_hours["recommendedAction"] == "quote"


@pytest.mark.parametrize("payload", [
    {**BASE,"caller":""}, {**BASE,"phone":"abc"}, {**BASE,"bot_confidence":1.1},
    {**BASE,"estimated_value":-1}, {**BASE,"sentiment":"angry"}, {**BASE,"extra":True},
])
def test_invalid_inputs_are_rejected(payload):
    assert client.post("/calls/triage", json=payload).status_code == 422


def test_fixture_and_health_endpoints():
    assert len(client.get("/calls").json()) == 5
    assert client.get("/health").json() == {"status":"ok","mode":"demo","source":"fictional_fixture"}
