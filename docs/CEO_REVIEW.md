# CEO Review

**Mode:** Scope reduction. The source suggests eventual autopilot, but the evidence only warrants a human recovery desk.

## Nuclear challenge and alternatives

The premise is strongest when reframed from call analytics to accountable revenue recovery. Minimal digest, dispatcher desk, and autonomous agent were compared in Office Hours. The dispatcher desk wins because it captures outcomes without introducing outbound automation risk. Twelve-month ideal: cross-provider recovery system with proven ROI and vertical policy learning.

## 1. Architecture
Keep ingestion, normalized call data, scoring policy, action, and outcome as separate boundaries. Do not put vendor payloads directly in product tables. Idempotency and policy versioning are mandatory.

## 2. Error and rescue map
Name failures: `invalid_signature` → reject/alert; `schema_drift` → quarantine; `duplicate_event` → acknowledge/suppress; `extraction_timeout` → human-review queue; `policy_missing` → default-safe hold; `contact_suppressed` → block action; `crm_write_failed` → visible retry; `outcome_conflict` → audit/manual resolution. No catch-all may silently discard a lead.

## 3. Security and threat model
Phone numbers, summaries, and recordings are sensitive. Encrypt, redact, minimize retention, isolate tenants, verify webhook signatures, enforce RBAC, log exports, and keep raw recordings out of the first release. Prompt injection inside transcripts is data, never instruction.

## 4. Data and interaction edges
Nil/empty input is quarantined; malformed provider input is rejected; upstream outage raises stale-ingest status. Double-click resolution must be idempotent. Navigation mid-action must retain draft state. Stale ownership returns a conflict. Slow writes show pending state. Back navigation cannot repeat contact.

## 5. Code quality
Use one canonical scoring contract and parity tests across client preview/backend. The prototype intentionally duplicates the deterministic rule for static hosting; production should serve signed results from one backend implementation.

## 6. Tests
Cover emergency ranking, handled suppression, quote/after-hours weighting, invalid inputs, duplicate events, tenant isolation, provider schema fixtures, policy versions, action conflicts, and mobile overflow. Prototype coverage includes core happy, invalid, empty/filter, resolution, and mobile paths.

## 7. Observability
Operational metrics and named alerts belong in v1. A ranking without precision/override/recovered-revenue measurement is theater.

## 8. State
Use relational constraints for unique provider event IDs, action state transitions, tenant ownership, and immutable policy/output versions. Do not overwrite outcomes.

## 9. API contract
Version provider adapters separately from the normalized internal schema. Apply strict request validation, explicit error codes, rate limits, and replay protection.

## 10. Performance
Daily queues are modest; correctness dominates. At 10x, batch extraction and indexed tenant/status/due-time queries. At 100x, partition ingestion and workers while preserving per-tenant ordering.

## 11. Design and UX
Hierarchy is correct: urgent queue first, failure reason second, next action third. Empty/loading/error/resolved states must remain explicit. Color never carries meaning alone. Mobile must avoid hidden queue columns and horizontal overflow.

## Decisions

- **Accepted:** one vertical, one human-in-the-loop queue, deterministic/auditable ranking, outcome capture.
- **Deferred:** live provider/CRM integration, model extraction, outbound automation, billing.
- **Not in scope:** autonomous emergency response, recorded-call storage, a generic analytics dashboard.
- **Strongest challenges:** unproven demand, attribution credibility, consent/safety.
- **Status:** DONE_WITH_CONCERNS until a dispatcher replay proves top-10 precision and recovered revenue.
