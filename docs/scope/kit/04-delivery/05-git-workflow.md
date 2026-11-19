# Git & CI
Trunk-based; `feat/<ticket>-slug`; squash merge; conventional commits; PR template (what/why/screenshot/ticket/tests); CI lint/typecheck/test/build → deploy on main; migrations via `prisma migrate dev`; seed must work on fresh DB (`pnpm db:seed --reset`); 24h freeze = fixes only with two reviewers; tag `v1.0-hackathon`.
