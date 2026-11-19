# Sprint Plan — 3 weeks (compress proportionally)
## Week 0 (2–3 days) Foundations
Repo, CI, compose (app, worker, db, minio), schema, auth/RBAC/audit, shell + nav + design tokens, shared components, seed v0, deploy. Exit: login; every nav item renders; worker heartbeat logs.
## Week 1 Ingest + Listening + Sentiment
A: Mentions queries, wall with SSE, mention drawer, topics UI, media page. B: lexicon sentiment + tests, aspect LLM pass + cache, trend detector, crisis detector + Alert model + drawer. C: connector interface, simulated stream with scenarios, RSS connector, tracker + `/collect` + demo landing page, seed v1 (25k mentions). Exit: beats 1–2 work.
## Week 2 Analytics + Feedback + Intelligence
A: surveys builder + public form + results + MPI, competitors benchmark + SoV, admin sources/simulation/imports UI. B: insight detectors + feed, recommendation engine + create-campaign, forecasting + chart band, KPI definitions service with C. C: CSV import wizard (GA4/Meta/Mailchimp/X), campaigns + email metrics, web funnel, paid media module (table, kanban, variance, alerts), reports PDF + schedule. Exit: beats 3–9 work.
## Week 3 Polish, QA, Pitch
QA pass + bug bash → freeze → seed review → rehearsals ×3 → dry-run judging → fix → deploy freeze, backups, recording → submit.
## Cut list (in order)
1. Forecast band → trend arrow only 2. Billing Kanban → table only 3. Report schedule → manual generate 4. Perception radar → table 5. API stubs → doc only 6. Media outlet reach ranking
