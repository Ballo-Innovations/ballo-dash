# System Architecture (CTO)

## Stack (locked — ADR-001)
Next.js 15 + TypeScript · Tailwind + shadcn · Recharts · PostgreSQL 16 + Prisma · Auth.js · **Ingest worker** (Node, same repo, `apps/worker`) running connectors on schedules · Server-Sent Events for live wall · @react-pdf/renderer for reports · MinIO for report PDFs & uploads · Anthropic API (server-only, cached) · docker-compose · GitHub Actions.

## Diagram
```mermaid
flowchart LR
  subgraph Sources
    RSS[RSS / News sites<br/>LIVE]
    TRK[First-party web tracker<br/>LIVE]
    SRV[Surveys /s/slug<br/>LIVE]
    CSV[CSV/JSON imports<br/>GA4 · Meta · Mailchimp · X export]
    SIM[Simulated social stream<br/>DEMO]
    API[X / Meta / LinkedIn connectors<br/>STUB shaped to real APIs]
  end
  subgraph Worker[Ingest worker]
    CONN[Connector registry] --> NORM[Normalise → Mention / Metric]
    NORM --> SENT[Sentiment T1]
    SENT --> ASP[Aspect T2 via LLM (cached)]
    ASP --> DET[Detectors: trend · crisis · insights]
  end
  subgraph App[Next.js]
    UI[Dashboard · Listening · Feedback · Campaigns · Paid · Competitors · Reports · Insights · Admin]
    SSE[SSE /api/stream]
    REP[Report renderer → PDF]
    REC[Recommendation engine]
  end
  DB[(PostgreSQL)]
  S3[(MinIO)]
  LLM[Anthropic API]
  Sources --> CONN
  Worker --> DB
  ASP --> LLM
  DB --> UI
  DB --> SSE --> UI
  REP --> S3
  REC --> DB
```

## Module boundaries
```
src/modules/
  listening/     mentions, keyword rules, wall, topics, media      (Dev A)
  intelligence/  sentiment, aspects, trend, crisis, detectors, forecast, recommendations, llm (Dev B)
  analytics/     social metrics, web tracker + sessions, email campaigns, KPIs, funnel (Dev C)
  paidmedia/     media plan lines, billing, variance, alerts         (Dev C)
  competitors/   entities, benchmark, share of voice                 (Dev A)
  feedback/      surveys, responses, NPS/CSAT, MPI                   (Dev A)
  reports/       templates, PDF, schedules                           (Dev C)
  insights/      feed, acknowledge, campaign recs UI                 (Dev B)
  admin/         users, roles, sources, simulation, audit            (Dev A)
apps/worker/     connectors/{rss,tracker,csv,simulated,x-stub,meta-stub,linkedin-stub}.ts, scheduler
```
Each module: `actions.ts`, `queries.ts`, `service.ts` (pure, tested), `types.ts`.

## Ingest pipeline rules
- Connector interface: `fetch(since): Promise<RawItem[]>` → normaliser → `Mention` or `MetricPoint`. Idempotent via `externalId` unique index.
- Batches of ≤500; sentiment T1 inline; T2 and detectors queued (in-process queue; BullMQ if time).
- Every connector run logged to `ConnectorRun` (status, counts, duration) — shown on Admin → Sources.
- Simulated stream: deterministic generator seeded by scenario files; runs at configurable rate; scenarios: `baseline`, `outage_kitwe`, `dc_launch_positive`, `competitor_price_cut`.

## Live wall
`/api/stream` SSE pushes new mentions + alerts; client keeps last 200 in memory; reconnect with Last-Event-ID.

## Cross-cutting
Audit on all writes · RBAC at action boundary · zod validation · money as integer ngwee · UTC storage, Africa/Lusaka display · LLM calls cached in `AiArtifact` with template fallback.

## Deployment
`docker compose up` (app, worker, db, minio) · prod on Railway/Render (app + worker as two services) · CI: lint/typecheck/test/build/deploy · seed idempotent.
