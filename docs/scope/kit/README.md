# Infratel Brand, Communications & Market Intelligence Platform — Project Kit
**Target:** iHub Hackathon 2026, Challenge 3 (Brand, Communications & Market Intelligence Automation)
**Team:** 3 developers (+ shared PM/QA duties)
**Goal:** Platinum-grade submission — unified analytics, social listening, customer feedback, and an AI insight layer, in one cohesive product.

## Read in this order on day 0 (≈2 hours)
1. `00-executive/01-vision-and-strategy.md`
2. `01-product/01-PRD.md` (coverage matrix)
3. `02-architecture/01-architecture.md` + `02-data-model.md`
4. `04-delivery/02-sprint-plan.md` + `03-tickets.csv`
5. `07-dev-setup/CLAUDE.md` → paste into repo root

## Folder map
| Folder | Owner | Contents |
|---|---|---|
| 00-executive | CEO | Vision, judging strategy, risk register |
| 01-product | PM | PRD, sentiment & crisis spec, KPI/metrics spec, surveys spec, AI insights spec |
| 02-architecture | CTO | Architecture, Prisma schema, API, data connectors, security, ADRs |
| 03-design | Design | Design system, wireframes, UX flows |
| 04-delivery | Eng manager | Roles, sprint plan, 75+ tickets CSV, DoD, git workflow |
| 05-qa | QA | Test strategy, test cases, seed data spec |
| 06-pitch | CEO/PM | Deck outline, demo script, one-pager |
| 07-dev-setup | Tech lead | CLAUDE.md, docker-compose, env, seed JSON, day-0 checklist |

## Ground rules
- One repo, one stack, one licence. Open-source tools (Metabase, Apache Superset, Matomo, Mautic, LimeSurvey) are reference only.
- **Data honesty:** real social APIs are paid/restricted. We ingest via *connectors* — some live (RSS news, Google-Analytics-style CSV export, survey responses, our own web tracker), some simulated with a realistic stream generator — and say so clearly. Judges reward a working pipeline over a fake API key.
- Sentiment and insights must be explainable: show the text, the score, and why.
- Every slice demoable alone. Protect the AI insight layer's time.
