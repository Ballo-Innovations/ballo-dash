# Feature promotion

Workspace rule: `../.cursor/rules/feature-promotion.mdc`. Promote **slices** (a feature plus its
dependencies), never whole environment branches.

## Git

- `main` is the only long-lived branch today. Never commit to it directly: branch off `origin/main`, open
  a PR, merge after CI passes.
- When staging and production environments exist (ticket K-06), they deploy from `main` with flags deciding
  what each environment shows. If environment branches are introduced later, promote with cherry-pick PRs.

## Flags

Every new page, nav item and API endpoint is gated by a `NEXT_PUBLIC_FEATURE_*` flag (ticket F-01 adds the
helper). Unset flags are **on in development and off everywhere else**. Launching a feature in an
environment means setting its variable to `true` in that Vercel environment after the code is merged.

| Flag | Env var | Ticket epic |
|---|---|---|
| Listening, media, alerts | `NEXT_PUBLIC_FEATURE_LISTENING` | L |
| Unified KPI dashboard | `NEXT_PUBLIC_FEATURE_KPI_DASHBOARD` | A |
| Campaigns | `NEXT_PUBLIC_FEATURE_CAMPAIGNS` | P |
| Paid media | `NEXT_PUBLIC_FEATURE_PAID_MEDIA` | P |
| Competitors | `NEXT_PUBLIC_FEATURE_COMPETITORS` | B |
| Feedback and surveys | `NEXT_PUBLIC_FEATURE_FEEDBACK` | S |
| Insights and recommendations | `NEXT_PUBLIC_FEATURE_INSIGHTS` | N |
| Reports v2 | `NEXT_PUBLIC_FEATURE_REPORTS_V2` | R |
| Admin console | `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE` | M |
| Billing | `NEXT_PUBLIC_FEATURE_BILLING` | K |

Security fixes (phase 0) are not flagged: they change no user-facing feature and must ship everywhere.

## QA tester portal

Each feature also gets user stories and cases in `ballo-backoffice/lib/qaSuites/data/` with `requires` set
to its flag (workspace `AGENTS.md`).
