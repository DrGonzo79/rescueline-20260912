# Architecture

```text
Vapi / Retell webhook
        |
        v
idempotent ingest -> normalize/redact -> policy + extraction -> ranked opportunity
       |                 |                    |                    |
   schema error       PII vault          low confidence        dispatcher queue
       |                 |                    |                    |
 quarantine + alert   retention TTL       human review       action -> outcome
                                                                  |
                                                           evaluation + ROI
```

## Prototype

The static Next.js app reads `data/calls.json` and mirrors a deterministic scoring function for a deployable demo. FastAPI independently exposes `GET /calls`, `GET /health`, and `POST /calls/triage` and reads the same fixture file. Python is runnable/tested source only; GitHub Pages hosts the frontend only.

## Production boundaries

Use a webhook gateway, tenant-scoped relational database, durable job queue, encrypted PII store, short-lived worker credentials, and immutable audit log. Every provider event carries a provider/tenant idempotency key. Schema mismatch is quarantined; extraction timeout produces `needs_review`; duplicate contact is suppressed; downstream CRM failure leaves the action retryable and visible.

## Observability

Track ingest lag, schema rejects, duplicate suppression, classification distribution, top-10 precision, action latency, recovery conversion, attributed revenue, no-response, override rate, and model/policy version. Alert on zero ingest for an active tenant, >2% schema rejection, queue age above SLA, emergency miss, provider signature failure, and outcome-write failure. Provide tenant-level audit search and a “why ranked” explanation on every opportunity.
