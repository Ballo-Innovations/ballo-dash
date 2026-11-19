# API (REST `/api/v1`, OpenAPI from zod). Auth: session or Bearer API key. Lists: `?page&pageSize&q&from&to&brandId&channel`.
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | /dashboard/kpis | ANALYST+ | strip with Δ, target, sourceKind |
| GET | /dashboard/series?metric= | ANALYST+ | time series + forecast |
| GET | /mentions | ANALYST+ | filters sentiment/topic/channel/region |
| GET | /mentions/{id} | ANALYST+ | with explain (matchedTerms, aspects) |
| GET | /stream | ANALYST+ | SSE mentions + alerts |
| GET | /topics | ANALYST+ | rising topics |
| GET | /media | ANALYST+ | news mentions by outlet |
| GET | /alerts · POST /alerts/{id}/ack · /resolve · /assign | COMMS+ | |
| GET | /competitors/benchmark | ANALYST+ | side-by-side |
| GET | /competitors/share-of-voice | ANALYST+ | by period/channel |
| GET/POST | /campaigns · GET/PATCH /campaigns/{id} | MARKETER+ | |
| GET/POST/PATCH | /campaigns/{id}/lines | MARKETER+ | media plan lines, billing status |
| GET | /paidmedia/summary | MARKETER+ | budget vs spend vs billing rollups |
| GET | /analytics/web/funnel · /sessions · /sources | ANALYST+ | |
| POST | /collect | public | tracker events |
| GET/POST | /surveys · GET /surveys/{id}/results | ANALYST+ | |
| GET/POST | /s/{slug} | public | survey page + submit |
| GET | /feedback/summary | ANALYST+ | NPS, CSAT, MPI, radar |
| GET | /insights · POST /insights/{id}/dismiss | ANALYST+ | |
| GET | /recommendations · POST /recommendations/{id}/status · /create-campaign | MARKETER+ | |
| GET | /forecast?metric= | ANALYST+ | |
| GET/POST | /reports · POST /reports/generate · GET /reports/{id}/pdf · POST /reports/schedule | MANAGER+ | |
| POST | /imports/{type} | ANALYST+ | multipart CSV: ga4, meta, mailchimp, x |
| GET/POST/PATCH | /admin/sources · POST /admin/sources/{id}/run | ADMIN | |
| POST | /admin/simulation/scenario | ADMIN | `{scenario, rate}` |
| GET | /admin/audit · /admin/users · /admin/api-keys | ADMIN | |
| GET | /openapi.json | public | |
