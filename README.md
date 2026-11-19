# Ballo Dash

Brand, communications and market intelligence for marketing teams: social, web and email analytics,
listening and sentiment, competitor benchmarks, paid media tracking, customer feedback, AI insights and
reports, in one dashboard.

Scope, decisions and tickets: [docs/scope/SCOPE.md](docs/scope/SCOPE.md) and [docs/scope/tickets/](docs/scope/tickets/README.md).

## Stack

Next.js 14 (Pages Router) and TypeScript, React-Bootstrap with the Light Able SCSS theme, ApexCharts,
Redux Toolkit, Drizzle ORM on Postgres, NextAuth (credentials), Upstash Redis, S3. Vitest and Playwright.

Hosting: the Next.js app on Vercel; Postgres and the background worker on a Ballo server (phase 1).

## Local setup

Requirements: Node 20.11 or later, Postgres 14 or later running locally.

```bash
npm ci
cp .env.example .env            # then fill in the blanks (see comments in the file)
createdb ballo_dash_dev
createdb ballo_dash_test        # for integration tests
npx drizzle-kit push            # local databases only
SEED_ADMIN_PASSWORD='choose-a-long-one' npm run db:seed
npm run dev                     # http://localhost:3000
```

`npm run db:seed` and `npm run drizzle:reset` refuse any database that is not on localhost unless you set
`ALLOW_DESTRUCTIVE_DB=<database name>`, and always refuse when `APP_ENV` is staging or production.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint (errors fail; warnings are legacy debt being paid down) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit tests (Vitest) |
| `npm run test:integration` | API and database tests against `ballo_dash_test` |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run build` | Production build (fails on type or lint errors) |
| `npx tsx scripts/encrypt-integration-secrets.ts` | Encrypt plaintext integration secrets; also used for key rotation (`DRY_RUN=1` to preview) |

CI runs lint, type check, unit and integration tests, build, a production dependency audit and a secret
scan on every pull request (`.github/workflows/ci.yml`).

## Security model

- **Deny by default.** `src/middleware.ts` requires a session for every page and API route except the
  list in `src/server/public-paths.ts`.
- **API routes** use `apiHandler` (`src/server/api.ts`): session, role capability, zod validation, rate
  limits, and one error shape `{ error: { code, message, details? } }`. The company always comes from the
  session, never the request.
- **Roles and capabilities** live in one matrix, `src/server/rbac.ts`.
- **Integration secrets** (access tokens, refresh tokens, app secrets) are encrypted at rest with
  AES-256-GCM (`src/lib/secret-box.ts`) and never sent to the browser.
- **Logs** go through `src/lib/logger.ts`, which redacts tokens, secrets and e-mail addresses.

## Project layout

```
src/
  pages/            routes (Pages Router) and API routes
  server/           server-only modules: auth, API wrapper, RBAC, rate limiting, domain services
  lib/              shared helpers (logger, encryption, platform clients)
  db/               Drizzle schema, client, seed scripts
  components/ views/ Layouts/   UI built on the Light Able template
  toolkit/          Redux slices
docs/               scope, tickets, QA, feature promotion, integration notes
tests/integration/  database-backed API tests
scripts/            one-off operational scripts
```

## Working rules

Read [CLAUDE.md](CLAUDE.md), [docs/QUALITY_ASSURANCE.md](docs/QUALITY_ASSURANCE.md) and
[docs/feature-promotion.md](docs/feature-promotion.md) before changing anything.
