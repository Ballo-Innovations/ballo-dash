# Epic K: Commercial

11 tickets, 83 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| K-01 | Company onboarding wizard | P0 | 5 | 10 | TODO |
| K-02 | Self-service sign-up, email verification, password reset | P0 | 5 | 10 | DONE (staging) |
| K-03 | Plan limits for FREE PRO ENTERPRISE | P0 | 5 | 8 | TODO |
| K-04 | Demo workspace seed | P0 | 3 | 10 | TODO |
| K-05 | Error tracking and health check | P1 | 5 | 5 | TODO |
| K-06 | Vercel project for the Next.js app | P0 | 1 | 6 | TODO |
| K-07 | Security headers and CSP | P0 | 5 | 4 | TODO |
| K-08 | Rebrand template leftovers | P1 | 5 | 4 | TODO |
| K-09 | Subscription billing and plan upgrade | P1 | 5 | 12 | TODO |
| K-10 | Provision the backend server: Postgres, worker runtime, backups | P0 | 1 | 10 | TODO |
| K-11 | Worker and migration deploy script | P0 | 2 | 4 | TODO |

## K-01 Company onboarding wizard

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 10h
- **Depends on:** F-04, C-03

**Acceptance criteria**

- [ ] New company sets name, logo, timezone, currency, own brand keywords and handles, competitors and first sources
- [ ] Ends on a populated dashboard or a clear empty state with next steps

## K-02 Self-service sign-up, email verification, password reset

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 5  **Estimate:** 10h
- **Depends on:** H-13

**Acceptance criteria**

- [x] Sign-up creates a company and its admin user
- [x] Email verified before access
- [x] Reset link single use and time limited
- [x] Sign-up, login and reset rate limited
- [x] Duplicate email and weak password rejected with clear messages
- [x] New company lands in the onboarding wizard (needs an email provider, decision D6)

**Notes:** Email via the BalloAds developer API (decided 2026-11-20). Deployed to dev and staging (2026-11-20). The email provider refuses example.com addresses, so test with a real inbox. Passwords need 10+ characters. Rate limits: sign-up 10/hour, resend and forgot-password 5/hour per address.

## K-03 Plan limits for FREE PRO ENTERPRISE

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 8h
- **Depends on:** B-01, C-01

**Acceptance criteria**

- [ ] Limits on competitors, sources, mentions per month, seats and AI calls enforced on the server with a clear upgrade message
- [ ] Limits in one config file (limit values are decision D5)

## K-04 Demo workspace seed

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 10h
- **Depends on:** C-08, F-05, F-06, F-07

**Acceptance criteria**

- [ ] Deterministic seed creates one sandbox company per the kit seed spec (4 brands, about 25k mentions over 120 days, metrics, web events, 6 campaigns, 24 plan lines, 3 surveys, 450 responses, historic alerts)
- [ ] Runs in under 90 seconds
- [ ] Prints counts
- [ ] Never touches other companies

## K-05 Error tracking and health check

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 5h
- **Depends on:** H-06

**Acceptance criteria**

- [ ] Unhandled server and client errors reported to the chosen service with company id and no PII
- [ ] /api/health checks the database and Redis

## K-06 Vercel project for the Next.js app

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 6h
- **Depends on:** H-08, H-10, K-10

**Acceptance criteria**

- [ ] Vercel project linked to the repo with preview, staging and production environments
- [ ] Every env var set per environment and documented
- [ ] Production deploys only from main after CI passes
- [ ] Database reachable from Vercel over TLS with a pooled connection
- [ ] Staging smoke test passes
- [ ] Rollback steps written

## K-07 Security headers and CSP

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 4h
- **Depends on:** H-01

**Acceptance criteria**

- [ ] CSP, HSTS, frame, referrer and content-type headers set
- [ ] Tracker and public survey pages still work
- [ ] No inline script violations in the console

## K-08 Rebrand template leftovers

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 4h
- **Depends on:** H-07

**Acceptance criteria**

- [ ] Title, favicon, help card link (currently points to the template vendor), breadcrumb title, login and email copy say Ballo Dash
- [ ] No template vendor names left in the UI
- [ ] No em dashes in UI copy

## K-09 Subscription billing and plan upgrade

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 12h
- **Depends on:** K-02, K-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_BILLING`

**Acceptance criteria**

- [ ] Company admin can choose and change plan and pay
- [ ] Plan changes take effect from the provider webhook, which is signature verified and idempotent
- [ ] Failed payment downgrades after a grace period with notice
- [ ] No card data touches our servers (payment provider is decision D5)

## K-10 Provision the backend server: Postgres, worker runtime, backups

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 10h
- **Depends on:** none

**Acceptance criteria**

- [ ] Inventory of the target Ballo server written first (what runs there, free capacity, how it is deployed) and nothing existing is changed
- [ ] Separate staging and production databases with least-privilege users
- [ ] TLS and firewall limited to Vercel and the worker
- [ ] Daily backups with one restore actually tested
- [ ] Node runtime and a service definition for the worker
- [ ] Secrets outside the repo (needs the host name and SSH access from George)

## K-11 Worker and migration deploy script

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 4h
- **Depends on:** K-10, C-02

**Acceptance criteria**

- [ ] One script deploys the environment branch tip only (fast-forward), holds a host lock, refuses when the running commit is not an ancestor of the new one, applies migrations before restarting the worker, and verifies the running commit afterwards
- [ ] Dry-run mode
- [ ] Rollback steps written
