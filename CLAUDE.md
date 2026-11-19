# Ballo Dash: agent notes

Read first: `README.md`, `docs/scope/SCOPE.md`, `docs/QUALITY_ASSURANCE.md`, `docs/feature-promotion.md`,
and the workspace `AGENTS.md` one level up.

## Work by ticket
Tickets live in `docs/scope/tickets/<epic>.md`. Restate the acceptance criteria, implement, test, then set
the ticket's **Status** and tick its criteria in the same PR. Do not mark a criterion done unless you
verified it.

## Conventions
- **API routes:** always `apiHandler({ METHOD: route({...}) })` from `src/server/api.ts`. Use
  `publicRoute` only for endpoints listed in `src/server/public-paths.ts`, and give them a rate limit.
  Take `companyId` from `user.companyId`, never from the query or body.
- **Permissions:** `capability` on the route; the matrix is `src/server/rbac.ts`.
- **Validation:** zod schemas on `query` and `body`.
- **Errors:** throw `ApiError` (or helpers in `src/server/errors.ts`) for client-visible errors; anything
  else becomes a generic 500.
- **Secrets:** never return them from an API, never log them. New secret columns use the
  `encryptedText` column type in `src/db/schema.ts`.
- **Logging:** `logger` from `src/lib/logger.ts`; `console.*` fails lint.
- **Environment:** add every new variable to `src/env.ts` and `.env.example`.
- **New pages, nav items and endpoints** go behind a feature flag (`docs/feature-promotion.md`).
- **UI** reuses the Light Able template (cards, `pc-*` layout classes, Phosphor icons, React-Bootstrap).
  No Tailwind. Check 375, 430, 768, 1280 and 1440 px in light and dark.
- **Copy:** no em dashes in anything a user reads.
- **Tests:** pure logic gets unit tests next to the file (`*.test.ts`); anything touching the database or a
  route gets an integration test in `tests/integration/` (`*.int.test.ts`), including a cross-company
  isolation check.

## Commands
`npm run lint && npm run typecheck && npm test && npm run test:integration && npm run build`
