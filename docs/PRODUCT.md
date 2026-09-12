# Product plan

## ICP and JTBD

**ICP:** US plumbing/HVAC operators with 5–30 field technicians, meaningful after-hours lead volume, an AI receptionist, and a human dispatcher who can respond. **JTBD:** “When automation fails a caller, show me which opportunity to recover first and exactly what my team should do.”

## MVP

Connect one post-call webhook, normalize the record, apply auditable vertical rules, rank an owner-scoped queue, assign a callback/text/quote, and capture booked/lost outcomes. The prototype ships the ranking and resolution interaction over fictional fixtures; it does not connect or contact anyone.

## Data model

- `Call`: tenant, provider ID, timestamps, caller token, consent state, intent, summary, sentiment, confidence.
- `Opportunity`: call ID, classification, priority score, estimated value, reasons, recommended action, policy version.
- `RecoveryAction`: owner, action type, due time, status, attempt metadata.
- `Outcome`: booked/lost/no-response, actual value, disposition reason, attribution confidence.
- `Policy`: tenant rules, emergency terms, service area, business hours, escalation route, version.

## Architecture and AI strategy

Provider webhooks enter an idempotent ingestion boundary, then normalization, redaction, policy evaluation, queue persistence, and outcome capture. Start deterministic: provider summaries plus explicit operating rules. Use an LLM later only for constrained intent extraction with a schema, confidence threshold, evaluation set, prompt/model version, and human fallback. Never let a model place an emergency call or promise price/availability without tenant policy.

## Economics

Hypothesis: $299/location/month plus usage above 1,000 calls. A customer with $900 average job value needs fewer than one incremental booking monthly to justify the fee. Target software gross margin above 80%; manual concierge review must fall below 20 minutes per location per day before scaling.

## Validation

Run a 14-day retrospective concierge pilot with three operators. Gates: ≥80% precision in the top-10 daily queue, median under 15 minutes from shift start to first callback, ≥10% recovery-to-booking conversion, ≥3x attributed gross profit to fee, and two customers willing to pay. Kill or reposition if dispatchers already review every miss effectively or attribution cannot survive scrutiny.

## Moat

Cross-provider normalized call/outcome history; vertical failure taxonomy; tenant policy graphs; and labeled recovery outcomes. “AI summaries” alone are not a moat. The feedback loop becomes valuable only when it improves rankings and provider configuration across a vertical.

## Risks

Consent and TCPA/state recording rules; PII retention; hallucinated intent; duplicate contact; emergency misrouting; provider schema drift; biased value estimates; CRM attribution disputes; low dispatcher trust; vendor bundling; and over-automation. Mitigate with redaction, idempotency keys, policy versions, reason codes, contact suppression, audit logs, and human confirmation.

## 30/60/90

- **30 days:** concierge replay, dispatcher observation, taxonomy, evaluation set, two design partners.
- **60 days:** one provider webhook, secure queue, assignment/outcomes, policy editor, weekly ROI proof.
- **90 days:** second provider, CRM write-back, tenant RBAC/audit trail, billing pilot, opt-in message/callback experiment after legal review.
