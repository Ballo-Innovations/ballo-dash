# Ballo Dash: assessment and scope

Date: 2026-11-19. Status: scoping only, nothing implemented. Tickets: [tickets/](tickets/README.md), one file per epic (103 tickets, 631 hours). Decisions in section 4 were given by George on 2026-11-19.

Source spec: the Lens project kit (`lens-project-kit`), written for a hackathon demo for one client (Infratel). Goal here: the same capability set as a commercial, multi-company product, built inside this repo and keeping this template's design.

## 1. What the repo is today

**Stack:** Next.js 14 (Pages Router), TypeScript, React-Bootstrap with the Light Able SCSS template, ApexCharts, Redux Toolkit, Drizzle on Postgres, NextAuth (credentials), Upstash Redis, S3.

**Real product code**
- Multi-company model: `companies`, `users` (roles ADMIN, MANAGER, ANALYST, CLIENT), `integrations`, `social_profiles`, `social_media_data_cache`, `marketing_plans`.
- Live API integrations for Facebook, Instagram, LinkedIn and X, with a database cache.
- Pages: `/dashboard`, `/data`, `/statistics`, `/reports` and `/reports/[platform]`, `/login`, home (weekly plan).

**Template leftovers:** about 190 of the 198 pages are template demos (forms, tables, e-commerce, courses, helpdesk, invoices and so on), with their reducers, JSON data and dependencies.

**Problems found (checked in the code)**

| Finding | Evidence | Ticket |
|---|---|---|
| Middleware only protects `/`, `/dashboard/*`, `/admin/*` | `src/middleware.ts` matcher | H-01 |
| 12 debug API routes ship in the app, one with no session check | `src/pages/api/debug/*`, `debug/cache.ts` | H-02 |
| `marketing_plans` and both upload-URL routes have no session check | `grep` for `getServerSession` | H-03 |
| Integration access tokens and app secrets stored in plain text | `integrations` table, README TODO | H-04 |
| Builds ignore type and lint errors; 24 TypeScript errors exist | `next.config.js`, `tsc --noEmit` | H-05 |
| 466 `console.log` calls, some printing company and session data | `src/pages/api/company.ts` | H-06 |
| No tests, no CI, no input validation library, no `.env.example`, no `docs/` | repo listing | H-08 to H-11 |
| `npm ci` fails without `--legacy-peer-deps` | apexcharts peer conflict | H-07 |
| No feature flag helper (workspace rule requires one for new pages) | repo listing | F-01 |

None of these were run against a live environment; they are from reading the code and running `tsc` locally.

## 2. Kit versus this repo: how the conflicts are resolved

| Topic | Kit says | Scope here | Why |
|---|---|---|---|
| Stack | Next 15 App Router, Tailwind, shadcn, Prisma, Recharts, pnpm monorepo | Keep Next 14 Pages Router, Bootstrap template, Drizzle, ApexCharts, single app | You asked to keep the template's design; a stack swap would discard the working integrations |
| Design | Dark-first custom tokens, Inter | Template shell, cards, sidebar and both themes; add semantic colours only (sentiment, alert severity, billing status, source kind) | Same reason |
| Tenancy | Single client, multi-tenancy out of scope | `companyId` on every new table, isolation tests (F-08) | Commercial product; the repo is already multi-company |
| Social data | Simulated stream, real APIs stubbed | Existing live connectors become first-class (C-03); simulation only in a sandbox company (C-08, K-04) | The repo already has what the kit could not get |
| Roles | 6 roles | Extend the enum; CLIENT maps to READONLY (F-02) | Matches the kit's capability matrix |
| Money | Integer ngwee, ZMW | Integer minor units, currency per company, ZMW default | Not every customer is Zambian |
| Hosting | docker-compose, Railway or Render | Next.js app on Vercel; Postgres and the worker on a Ballo server reached over SSH (C-02, K-06, K-10, K-11) | Your decision; hosting is set up from scratch |
| Pitch epic, demo script, judging | In kit | Dropped | Hackathon only |
| Added for commercial use | Not in kit | Self-service sign-up and reset, onboarding, plan limits, subscription billing, encryption, error tracking, deploy, QA portal suites | Epics H, K, Q |

Every kit capability in the PRD coverage matrix (22 rows) maps to at least one ticket. Nothing was cut.

## 3. Phases

| Phase | Contents | Tickets | Hours |
|---|---|---|---|
| 0 Hardening | Close the security gaps, types, tests, CI, docs, remove template pages | 13 | 60 |
| 1 Foundations | Server and Vercel setup, flags, roles, audit, schema, shell, shared components | 14 | 76 |
| 2 Ingest and listening core | Worker, connectors, tracker, imports, sentiment, live wall | 15 | 106 |
| 3 Analytics and operations | KPIs, dashboard, campaigns, paid media, competitors, alerts, admin, demo seed | 23 | 139 |
| 4 Feedback and intelligence | Surveys, insights, recommendations, forecasting, reports | 17 | 104 |
| 5 Commercial readiness and QA | Sign-up, onboarding, plans, billing, QA portal, accessibility, security, performance | 21 | 146 |

P0: 79 tickets, 493 hours. P1: 21 tickets, 117 hours. P2: 3 tickets, 21 hours.

The estimates are engineering hours for someone who knows the codebase and exclude review, stakeholder acceptance and waiting on third parties (platform API approvals, legal review). They are judgement, not measured velocity.

Phase 0 is first because new public endpoints (tracker, surveys) should not be added to an app whose existing routes are open.

## 4. Decisions

**Made (2026-11-19)**

| Decision | Answer | Effect |
|---|---|---|
| Product name | Ballo Dash | K-08; "Lens" is only the name of the source kit |
| Template demo pages | Delete | H-07 |
| Sign-up | Self-service | K-02 and K-03 are P0; K-09 billing added |
| Hosting | Set up from scratch: Next.js on Vercel, backend on Ballo servers over SSH | K-06, K-10, K-11, C-02 |
| Ticket home | Markdown files in this folder | `tickets/` |

**Hosting shape**

- **Vercel:** the Next.js app, including pages, API routes, the tracker endpoint, public survey pages and the live stream.
- **Ballo server:** Postgres (staging and production databases) and one Node worker from this repo that runs connectors, detectors, the sandbox generator and scheduled reports.
- The worker deploys by script with a host lock and an ancestor check, matching the workspace deploy rules (K-11).

**Still open**

| # | Decision | Recommendation | Blocks |
|---|---|---|---|
| D2 | First customer or design partner and target launch date | Needed to order phases 3 and 4 | Sequencing |
| D4 | Which Ballo server (host name, SSH access) and which Vercel team | Needed before any hosting work; I have not connected to any server | K-10, K-06 |
| D5 | Plan limit values, prices and payment provider | Start with limits only; add payment when prices are set | K-03, K-09 |
| D6 | Email provider for verification, alerts and reports | Whatever other Ballo products use | K-02, L-07, R-04 |
| D7 | Legal review of data protection wording | Required before public surveys and sign-up go live | M-06, S-02, K-02 |
| D8 | Claude API key and monthly AI budget | Everything degrades to templates without it | I-02, I-03, N-02 |

## 5. Main risks

1. **Platform API limits.** Meta, LinkedIn and X restrict brand-mention and competitor data. Listening on social will be partial (own-page comments and posts) unless a paid listening data provider is added. This is the biggest gap between a demo and a commercial product, and it is not ticketed because it is a buying decision.
2. **Template weight.** Until H-07 lands, the build is slow and the peer conflict remains.
3. **Sentiment quality on local language.** The lexicon approach is explainable but limited; I-01 makes the lexicon editable per company and I-03 adds the LLM pass.
4. **Real-time on Vercel.** The live wall stream (L-02) must end before the function duration limit and resume cleanly on the client.
5. **Shared server.** The worker and database go on a server that may already run other Ballo services; K-10 starts with an inventory and changes nothing existing.
6. **Workspace rules.** Every module ships behind a `NEXT_PUBLIC_FEATURE_*` flag and needs QA portal suites in `ballo-backoffice` (Q-01). No changes to `ballo-ads-web-app` are needed.
