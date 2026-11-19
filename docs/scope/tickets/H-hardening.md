# Epic H: Hardening

13 tickets, 60 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| H-01 | Protect every app route and API route by default in middleware | P0 | 0 | 4 | DONE |
| H-02 | Remove or admin-gate the 12 /api/debug routes and /api/cache/view | P0 | 0 | 3 | DONE |
| H-03 | Add session and company checks to marketing_plans and upload URL routes | P0 | 0 | 3 | DONE |
| H-04 | Encrypt integration access tokens and app secrets at rest | P0 | 0 | 6 | DONE |
| H-05 | Fix the 24 TypeScript errors and stop ignoring type and lint errors in builds | P0 | 0 | 8 | DONE |
| H-06 | Replace 466 console.log calls with a levelled server logger | P1 | 0 | 5 | DONE |
| H-07 | Prune unused template pages and dependencies | P1 | 0 | 10 | DONE |
| H-08 | Env schema with zod and .env.example | P0 | 0 | 3 | DONE |
| H-09 | Test tooling: Vitest and Playwright with npm scripts | P0 | 0 | 5 | DONE |
| H-10 | GitHub Actions CI | P0 | 0 | 3 | IN PROGRESS |
| H-11 | Repo docs: QUALITY_ASSURANCE.md copy and feature-promotion.md | P0 | 0 | 2 | DONE |
| H-12 | Standard API helper: session, role, zod validation, error shape | P0 | 0 | 5 | IN PROGRESS |
| H-13 | Rate limiting helper on Upstash Redis | P1 | 0 | 3 | DONE |

## H-01 Protect every app route and API route by default in middleware

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 4h
- **Depends on:** none

**Acceptance criteria**

- [x] Matcher covers all pages and /api except an explicit public allowlist (login, /s/*, /api/collect, /t.js, auth)
- [x] Unauthenticated request to any other page redirects to /login and any other API returns 401
- [x] Test per allowlisted and non-allowlisted route

## H-02 Remove or admin-gate the 12 /api/debug routes and /api/cache/view

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-01

**Acceptance criteria**

- [x] Debug routes deleted or return 404 outside development
- [x] None can read or mutate another company's data
- [x] /api/debug/cache.ts no longer reachable without a session

## H-03 Add session and company checks to marketing_plans and upload URL routes

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-01

**Acceptance criteria**

- [x] Marketing_plans/route.ts, uploads/logo-upload-url.ts and uploads/cover-photos-upload-url.ts reject requests with no session
- [x] All reads and writes scoped to session companyId
- [x] Negative tests

**Notes:** The old routes are replaced by /api/plan, /api/uploads/company-image and PATCH /api/company (the UI already called /api/plan and /api/upload-url, which did not exist).

## H-04 Encrypt integration access tokens and app secrets at rest

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 6h
- **Depends on:** none

**Acceptance criteria**

- [x] AccessToken, refreshToken and appSecret encrypted with a key from env
- [x] Migration re-encrypts existing rows
- [x] No API response or log line contains a token
- [x] Closes the README TODO about the exposed token

**Notes:** Run `npx tsx scripts/encrypt-integration-secrets.ts` once per environment after deploying (DRY_RUN=1 first).

## H-05 Fix the 24 TypeScript errors and stop ignoring type and lint errors in builds

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 8h
- **Depends on:** none

**Acceptance criteria**

- [x] Tsc --noEmit reports 0 errors
- [x] Next.config.js no longer sets ignoreBuildErrors or ignoreDuringBuilds
- [x] Next build passes

## H-06 Replace 466 console.log calls with a levelled server logger

- **Status:** DONE
- **Priority:** P1  **Phase:** 0  **Estimate:** 5h
- **Depends on:** none

**Acceptance criteria**

- [x] Server logger with levels and redaction of tokens and emails
- [x] No console.log left in src (lint rule enforces it)
- [x] Client code logs nothing in production

## H-07 Prune unused template pages and dependencies

- **Status:** DONE
- **Priority:** P1  **Phase:** 0  **Estimate:** 10h
- **Depends on:** H-05

**Acceptance criteria**

- [x] Template demo pages removed (forms, tables, e-commerce, courses, helpdesk, invoice, membership, gallery, widgets, ui-kit, landing variants) with their views, reducers and JSON data
- [x] Unused packages removed (CKEditor, TinyMCE, FullCalendar, MUI, PrimeReact, uppy and others confirmed unused)
- [x] Npm ci works without --legacy-peer-deps
- [x] Build passes
- [x] Remaining real pages unchanged in screenshots (removal approved by George on 2026-11-19) (Reviewed in screenshots at 375, 430, 768, 1280 and 1440 px, light and dark, on the production build. No before-and-after baseline comparison was made. Dead template sidebar links found and removed.)

**Notes:** MUI stays (used by the table, avatar and skeletons) together with its Emotion peers.

## H-08 Env schema with zod and .env.example

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** none

**Acceptance criteria**

- [x] Src/env.ts validates all required variables at boot and fails fast with a readable message
- [x] .env.example documents every variable
- [x] README setup section rewritten (LinkedIn client id removed from README)

## H-09 Test tooling: Vitest and Playwright with npm scripts

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 5h
- **Depends on:** H-05

**Acceptance criteria**

- [x] Npm run test, test:integration (against a disposable Postgres database), test:e2e and typecheck exist and pass with one sample test each

## H-10 GitHub Actions CI

- **Status:** IN PROGRESS
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-09

**Acceptance criteria**

- [x] Pull requests run lint, typecheck, unit and integration tests, build, and a secret and dependency scan
- [ ] Required for merge on main

**Notes:** Making CI required is a GitHub branch protection setting that needs a repo admin.

## H-11 Repo docs: QUALITY_ASSURANCE.md copy and feature-promotion.md

- **Status:** DONE
- **Priority:** P0  **Phase:** 0  **Estimate:** 2h
- **Depends on:** none

**Acceptance criteria**

- [x] Docs/QUALITY_ASSURANCE.md with repo commands and known gaps
- [x] Docs/feature-promotion.md
- [x] Kit copied to docs/lens/kit for reference (Copied to docs/scope/kit.)
- [x] CLAUDE.md at repo root pointing to them

## H-12 Standard API helper: session, role, zod validation, error shape

- **Status:** IN PROGRESS
- **Priority:** P0  **Phase:** 0  **Estimate:** 5h
- **Depends on:** H-01, H-08

**Acceptance criteria**

- [x] WithApi wrapper gives handlers { session, companyId, role }, validates input with zod, returns { error: { code, message } } and never leaks stack traces
- [ ] Existing data and integrations routes migrated to it

**Notes:** Integrations, company, user, plan and upload routes use apiHandler. The /api/data/* platform routes still use hand-written session checks (session-scoped, behind the middleware); they move to apiHandler when the connector work (C-03) rewrites them.

## H-13 Rate limiting helper on Upstash Redis

- **Status:** DONE
- **Priority:** P1  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-12

**Acceptance criteria**

- [x] Reusable limiter keyed by IP or key
- [x] Applied to login
- [x] Returns 429 with Retry-After
- [x] Unit tested with a fake store

**Notes:** Applied to sign-in (per IP and per email) and uploads.
