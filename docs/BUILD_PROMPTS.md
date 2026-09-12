# Phased build prompts

1. **Ingestion:** Implement one signed provider webhook with replay protection, tenant idempotency, strict normalized schema, quarantine UI, and adapter contract tests.
2. **Secure queue:** Add tenant RBAC, encrypted phone fields, assignment state machine, audit events, stale ownership conflicts, and retention jobs.
3. **Evaluation:** Build a labeled replay harness comparing rules and constrained model extraction by policy/model version; expose precision, overrides, latency, and emergency misses.
4. **Outcomes:** Add CRM write-back behind retryable outbox jobs and measure booked/lost/no-response with attribution confidence.
5. **Controlled action:** After legal review, add tenant-approved message templates, suppression rules, consent evidence, double-contact prevention, and human confirmation.
