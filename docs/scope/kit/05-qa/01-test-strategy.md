# Test Strategy
| Layer | Tool | Scope | Owner |
|---|---|---|---|
| Unit | Vitest | sentiment lexicon (table-driven), trend/crisis detectors (synthetic series), KPI formulas, paid media variance, NPS/CSAT/MPI, forecast, RBAC | each dev |
| Integration | Vitest + test DB | connectors normalise + idempotency; server actions audit/rbac; SSE endpoint | Dev C |
| E2E | Playwright | login → inject crisis → alert ack → survey submit → report PDF | Dev C |
| Manual | `02-test-cases.md` | all demo beats, all roles | Dev C nightly; all week 3 |
| Perf | Lighthouse + timing | dashboard, wall, competitors on full seed | Dev A |
| Security | checklist | RBAC bypass, rate limits on public endpoints, token hashing | Dev A |
Rules: spec change ⇒ test change in same PR; CI blocks on unit; Playwright nightly + on tag; bug priority P0 = breaks a demo beat.
