# Security, RBAC, Audit, Data Protection
| Capability | ADMIN | MANAGER | ANALYST | MARKETER | COMMS | READONLY |
|---|---|---|---|---|---|---|
| View dashboards/listening | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Acknowledge/resolve alerts | ✓ | ✓ | – | – | ✓ | – |
| Campaigns & paid media edit | ✓ | ✓ | – | ✓ | – | – |
| Surveys create | ✓ | ✓ | ✓ | ✓ | – | – |
| Reports generate/schedule | ✓ | ✓ | ✓ | – | – | – |
| Sources, simulation, users, audit, API keys | ✓ | – | – | – | – | – |
Server-side `requireRole`; audit via `withAudit` on all writes; survey responses anonymous unless consent; export/erase by response id; public endpoints (`/collect`, `/s/*`) rate-limited; HMAC on import webhooks; API keys hashed; CSP headers; no secrets in repo. Align with Zambia Data Protection Act 2021 — say "aligned".
