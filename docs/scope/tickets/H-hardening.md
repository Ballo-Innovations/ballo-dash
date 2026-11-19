# Epic H: Hardening

13 tickets, 60 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| H-01 | Protect every app route and API route by default in middleware | P0 | 0 | 4 | TODO |
| H-02 | Remove or admin-gate the 12 /api/debug routes and /api/cache/view | P0 | 0 | 3 | TODO |
| H-03 | Add session and company checks to marketing_plans and upload URL routes | P0 | 0 | 3 | TODO |
| H-04 | Encrypt integration access tokens and app secrets at rest | P0 | 0 | 6 | TODO |
| H-05 | Fix the 24 TypeScript errors and stop ignoring type and lint errors in builds | P0 | 0 | 8 | TODO |
| H-06 | Replace 466 console.log calls with a levelled server logger | P1 | 0 | 5 | TODO |
| H-07 | Prune unused template pages and dependencies | P1 | 0 | 10 | TODO |
| H-08 | Env schema with zod and .env.example | P0 | 0 | 3 | TODO |
| H-09 | Test tooling: Vitest and Playwright with npm scripts | P0 | 0 | 5 | TODO |
| H-10 | GitHub Actions CI | P0 | 0 | 3 | TODO |
| H-11 | Repo docs: QUALITY_ASSURANCE.md copy and feature-promotion.md | P0 | 0 | 2 | TODO |
| H-12 | Standard API helper: session, role, zod validation, error shape | P0 | 0 | 5 | TODO |
| H-13 | Rate limiting helper on Upstash Redis | P1 | 0 | 3 | TODO |

## H-01 Protect every app route and API route by default in middleware

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 4h
- **Depends on:** none

**Acceptance criteria**

- [ ] Matcher covers all pages and /api except an explicit public allowlist (login, /s/*, /api/collect, /t.js, auth)
- [ ] Unauthenticated request to any other page redirects to /login and any other API returns 401
- [ ] Test per allowlisted and non-allowlisted route

## H-02 Remove or admin-gate the 12 /api/debug routes and /api/cache/view

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-01

**Acceptance criteria**

- [ ] Debug routes deleted or return 404 outside development
- [ ] None can read or mutate another company's data
- [ ] /api/debug/cache.ts no longer reachable without a session

## H-03 Add session and company checks to marketing_plans and upload URL routes

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-01

**Acceptance criteria**

- [ ] Marketing_plans/route.ts, uploads/logo-upload-url.ts and uploads/cover-photos-upload-url.ts reject requests with no session
- [ ] All reads and writes scoped to session companyId
- [ ] Negative tests

## H-04 Encrypt integration access tokens and app secrets at rest

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 6h
- **Depends on:** none

**Acceptance criteria**

- [ ] AccessToken, refreshToken and appSecret encrypted with a key from env
- [ ] Migration re-encrypts existing rows
- [ ] No API response or log line contains a token
- [ ] Closes the README TODO about the exposed token

## H-05 Fix the 24 TypeScript errors and stop ignoring type and lint errors in builds

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 8h
- **Depends on:** none

**Acceptance criteria**

- [ ] Tsc --noEmit reports 0 errors
- [ ] Next.config.js no longer sets ignoreBuildErrors or ignoreDuringBuilds
- [ ] Next build passes

## H-06 Replace 466 console.log calls with a levelled server logger

- **Status:** TODO
- **Priority:** P1  **Phase:** 0  **Estimate:** 5h
- **Depends on:** none

**Acceptance criteria**

- [ ] Server logger with levels and redaction of tokens and emails
- [ ] No console.log left in src (lint rule enforces it)
- [ ] Client code logs nothing in production

## H-07 Prune unused template pages and dependencies

- **Status:** TODO
- **Priority:** P1  **Phase:** 0  **Estimate:** 10h
- **Depends on:** H-05

**Acceptance criteria**

- [ ] Template demo pages removed (forms, tables, e-commerce, courses, helpdesk, invoice, membership, gallery, widgets, ui-kit, landing variants) with their views, reducers and JSON data
- [ ] Unused packages removed (CKEditor, TinyMCE, FullCalendar, MUI, PrimeReact, uppy and others confirmed unused)
- [ ] Npm ci works without --legacy-peer-deps
- [ ] Build passes
- [ ] Remaining real pages unchanged in screenshots (removal approved by George on 2026-11-19)

## H-08 Env schema with zod and .env.example

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** none

**Acceptance criteria**

- [ ] Src/env.ts validates all required variables at boot and fails fast with a readable message
- [ ] .env.example documents every variable
- [ ] README setup section rewritten (LinkedIn client id removed from README)

## H-09 Test tooling: Vitest and Playwright with npm scripts

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 5h
- **Depends on:** H-05

**Acceptance criteria**

- [ ] Npm run test, test:integration (against a disposable Postgres database), test:e2e and typecheck exist and pass with one sample test each

## H-10 GitHub Actions CI

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-09

**Acceptance criteria**

- [ ] Pull requests run lint, typecheck, unit and integration tests, build, and a secret and dependency scan
- [ ] Required for merge on main

## H-11 Repo docs: QUALITY_ASSURANCE.md copy and feature-promotion.md

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 2h
- **Depends on:** none

**Acceptance criteria**

- [ ] Docs/QUALITY_ASSURANCE.md with repo commands and known gaps
- [ ] Docs/feature-promotion.md
- [ ] Kit copied to docs/lens/kit for reference
- [ ] CLAUDE.md at repo root pointing to them

## H-12 Standard API helper: session, role, zod validation, error shape

- **Status:** TODO
- **Priority:** P0  **Phase:** 0  **Estimate:** 5h
- **Depends on:** H-01, H-08

**Acceptance criteria**

- [ ] WithApi wrapper gives handlers { session, companyId, role }, validates input with zod, returns { error: { code, message } } and never leaks stack traces
- [ ] Existing data and integrations routes migrated to it

## H-13 Rate limiting helper on Upstash Redis

- **Status:** TODO
- **Priority:** P1  **Phase:** 0  **Estimate:** 3h
- **Depends on:** H-12

**Acceptance criteria**

- [ ] Reusable limiter keyed by IP or key
- [ ] Applied to login
- [ ] Returns 429 with Retry-After
- [ ] Unit tested with a fake store
