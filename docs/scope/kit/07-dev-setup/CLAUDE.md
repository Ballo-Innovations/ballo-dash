# CLAUDE.md — Lens (repo root)
## What this is
Lens: brand, communications & market intelligence platform for iHub Hackathon 2026, Challenge 3. Specs in `/docs`. Read `docs/01-product/01-PRD.md`, `02-sentiment-trend-crisis-spec.md`, `03-kpi-metrics-and-paid-media-spec.md`, `docs/02-architecture/01-architecture.md` before non-trivial changes.
## Stack (do not change)
Next.js 15 App Router · TS strict · Tailwind + shadcn · Prisma + Postgres 16 · Auth.js · Recharts · SSE · @react-pdf/renderer · MinIO · Vitest · Playwright · pnpm workspaces (`apps/web`, `apps/worker`, `packages/db`, `packages/intelligence`).
## Commands
`pnpm dev` (web+worker) · `pnpm db:migrate` · `pnpm db:seed --reset` · `pnpm test` · `pnpm lint` · `pnpm typecheck` · `docker compose up`
## Conventions
- Modules `src/modules/<name>/{actions,queries,service,types}.ts`; logic in `service.ts` pure + tested.
- Mutations: `requireRole` → zod → `withAudit`.
- Every record and KPI carries `sourceKind`; UI shows SourceChip wherever a number appears.
- Money integer ngwee (`formatZMW`); dates UTC, display Africa/Lusaka; enums from Prisma only.
- Connectors implement `Connector` in `apps/worker/connectors`; idempotent via `externalId`; log `ConnectorRun`.
- Sentiment T1 is pure (`packages/intelligence/sentiment.ts`) with the lexicon JSON; T2 (LLM) only via `lib/llm.ts`, cached in `AiArtifact`, template fallback, never throw.
- Detectors (trend, crisis, insights) are pure functions over arrays; tests use synthetic series in `tests/fixtures`.
- Drawers for detail; loading/empty/error states mandatory; no `any`; no console.log.
## Reference (read-only, never copy)
Matomo, Mautic, Metabase, Superset, LimeSurvey, sentiment libs for ideas only.
## Working style
Ticket by ticket from `docs/04-delivery/03-tickets.csv`; restate acceptance criteria first; run `pnpm typecheck && pnpm test` after; summarise.
