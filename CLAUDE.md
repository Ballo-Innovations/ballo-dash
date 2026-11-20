# Ballo Dash web: agent notes

Read first: `README.md`, `docs/scope/SCOPE.md`, `docs/QUALITY_ASSURANCE.md`, `docs/feature-promotion.md`,
the workspace `AGENTS.md` one level up, and the API repo (`../ballo-dash-api/CLAUDE.md`).

## Two repos
- **This repo is UI only.** No API routes, no database, no secrets beyond `SESSION_SECRET`. New endpoints,
  validation, permissions and data access belong in `ballo-dash-api`.
- A feature that needs both: open a PR in each, merge the API first, then the web change.
- The browser calls `/api/...`; Vercel forwards it to the API. Keep paths relative (`fetch("/api/x")`).

## Work by ticket
Tickets live in `docs/scope/tickets/<epic>.md` (they cover both repos). Restate the acceptance criteria,
implement, test, then set the ticket's **Status** and tick verified criteria in the same PR.

## Conventions
- **Session:** `useSession()` from `src/contexts/SessionContext.tsx` (user from `/api/auth/me`).
  Sign-in and sign-out go through the API (`/api/auth/login`, `/api/auth/logout`) followed by a full page load.
- **Public pages** are listed in `src/server/public-paths.ts`; everything else needs a session.
- **New pages and nav items** go behind a feature flag (`src/lib/feature-flags.ts`).
- **UI** reuses the Light Able template (cards, `pc-*` layout classes, Phosphor icons, React-Bootstrap).
  No Tailwind. Check 375, 430, 768, 1280 and 1440 px in light and dark.
- **Logging:** `logger` from `src/lib/logger.ts`; `console.*` fails lint.
- **Copy:** no em dashes in anything a user reads.
- **Global CSS** may only be imported from `src/pages/_app.tsx`. Turbopack's CSS parser is strict: invalid
  CSS fails the build.

## Checks and deploys
No GitHub Actions. The pre-push hook runs lint, types and unit tests. Before merging, run
`npm run deploy:staging -- <branch>` (full checks on the pushed commit, then a staging deploy) and put the
result in the PR. Never run `vercel deploy` by hand against the live project.

## Commands
`npm run lint && npm run typecheck && npm test && npm run build`
