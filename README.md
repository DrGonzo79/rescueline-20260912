# RescueLine

A runnable prototype of a missed-call recovery desk for plumbing/HVAC businesses using AI receptionists. It ranks fictional post-call records, explains failures, recommends a callback/text/quote, supports manual demo-call triage, and records demo resolutions.

**Live frontend:** https://drgonzo79.github.io/rescueline-20260912/

> Demo only: all calls, identities, values, scores, and outcomes are fictional. No live telephony, AI, CRM, message, booking, customer data, or payment integration exists. The Python API is not publicly hosted.

## Run

```bash
npm ci
npm run dev
```

```bash
cd api
uv sync --frozen
uv run uvicorn main:app --reload
```

## Verify

```bash
npm run typecheck
cd api && uv run pytest -q
cd .. && npm run test:e2e
NEXT_PUBLIC_BASE_PATH=/rescueline-20260912 npm run build
npm audit --audit-level=high
```

## Deployment

GitHub Actions installs locked dependencies, typechecks, runs Python and Playwright tests, builds a repo-base-path-aware static export, and deploys `out/` to Pages. Pages hosts only the static Next.js frontend. FastAPI remains locally runnable and CI-tested source until separate hosting is approved.

See [source notes](research/notes.md), [product plan](docs/PRODUCT.md), [architecture](docs/ARCHITECTURE.md), [Office Hours](docs/OFFICE_HOURS.md), [CEO Review](docs/CEO_REVIEW.md), and [build prompts](docs/BUILD_PROMPTS.md).
