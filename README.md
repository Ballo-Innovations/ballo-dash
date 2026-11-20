# Ballo Dash (web)

Brand, communications and market intelligence for marketing teams: social, web and email analytics,
listening and sentiment, competitor benchmarks, paid media tracking, customer feedback, AI insights and
reports, in one dashboard.

This repo is the **web app**. The backend is a separate repo,
[ballo-dash-api](https://github.com/Ballo-Innovations/ballo-dash-api).

Scope, decisions and tickets: [docs/scope/SCOPE.md](docs/scope/SCOPE.md) and [docs/scope/tickets/](docs/scope/tickets/README.md).

## How it fits together

```
Browser ──► Vercel: Next.js web app ──/api/*──► ballo-dash-api (NestJS) ──► Postgres, Redis
              pages, UI, proxy.ts        rewrite      on balloads_dev_staging (staging)
```

- The browser only talks to the web app's domain. `next.config.js` forwards `/api/*` to `API_ORIGIN`, so the
  API's session cookie is first-party and there is no CORS.
- The web app has **no database access and no server-side business logic**. Every read and write goes
  through the API, which authorises each request.
- `src/proxy.ts` checks the session cookie (shared `SESSION_SECRET`) only to redirect signed-out visitors
  to `/login` before a page renders.

## Stack

Next.js 16 (Pages Router, Turbopack), React 19, TypeScript, React-Bootstrap with the Light Able SCSS theme,
ApexCharts, Redux Toolkit. Vitest and Playwright. Deployed on Vercel.

## Local setup

Requirements: Node 20.9 or later (24 recommended) and a running local API (see the API repo's README).

```bash
npm ci
cp .env.example .env      # API_ORIGIN=http://localhost:3001, SESSION_SECRET = the API's value
npm run dev               # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint (errors fail; legacy warnings are capped and only go down) |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright against `next start` and a local API (build first) |
| `npm run check` | Lint, types, unit tests, production build |
| `npm run deploy:staging -- <branch>` | Full checks on a clean copy of the pushed branch, then deploy to https://ballo-dash-staging.vercel.app |

There is no GitHub Actions CI. A pre-push hook (`.githooks/pre-push`, enabled by `npm install`) runs lint,
types and unit tests; the staging deploy runs the full suite on the exact commit it deploys.

## Project layout

```
src/
  pages/            routes (Pages Router); no API routes here
  proxy.ts          signed-out visitors to /login
  contexts/         session (from /api/auth/me) and app state
  components/ views/ Layouts/   UI built on the Light Able template
  services/         browser-side API clients
  toolkit/          Redux slices
  lib/              logger, feature flags, session check, redirects
docs/               scope, tickets, QA, feature promotion
tests/e2e/          Playwright
```

## Working rules

Read [CLAUDE.md](CLAUDE.md), [docs/QUALITY_ASSURANCE.md](docs/QUALITY_ASSURANCE.md) and
[docs/feature-promotion.md](docs/feature-promotion.md) before changing anything.
