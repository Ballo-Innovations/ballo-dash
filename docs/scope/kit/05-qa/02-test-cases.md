# Test Cases
## Auth/RBAC
- [ ] TC-01 Each of 6 roles sees permitted nav only; direct URL to /admin as ANALYST → 403
- [ ] TC-02 COMMS can ack alert; ANALYST cannot
- [ ] TC-03 API key Bearer works; revoked → 401
## Listening & sentiment
- [ ] TC-10 Inject `baseline` scenario → wall shows new mentions ≤2s; SSE reconnects after network blip
- [ ] TC-11 Mention "fibre down again in Kitwe, ba Infratel 😤" → NEG, matchedTerms include "down"; drawer highlights
- [ ] TC-12 "not reliable" scores NEG (negation); "natotela Infratel, fast install" → POS
- [ ] TC-13 Low-confidence mention triggers aspect pass; with API key unset shows fallback without error
- [ ] TC-14 Filters sentiment+channel+region+brand combine; counts match list
- [ ] TC-15 Rising topics shows #ZedNet after injected spike with z ≥ 2
- [ ] TC-16 Media page lists live RSS articles with outlet reach; brand keyword match correct
## Crisis
- [ ] TC-20 Inject `outage_kitwe` → CRISIS alert within 3 min; region Kitwe; aspect network reliability; 5 evidence mentions
- [ ] TC-21 Ack → status ACKNOWLEDGED, audit row; Resolve → RESOLVED; banner clears
- [ ] TC-22 Cooldown: second inject within 60 min does not duplicate alert for same topic
- [ ] TC-23 Recommended response text present; LLM narrative cached (same on reload)
## Dashboard & KPIs
- [ ] TC-30 KPI values match SQL spot-checks (mentions, sentiment index, SoV, sessions)
- [ ] TC-31 Every KPI shows source chip; period change recalculates Δ
- [ ] TC-32 Forecast band renders for sentiment & mentions; forecast test series within tolerance
## Competitors
- [ ] TC-40 Benchmark table 4 brands × 8 metrics; SoV sums to 100%
- [ ] TC-41 Inject `competitor_price_cut` → COMPETITOR_SURGE insight + recommendation
## Web & campaigns
- [ ] TC-50 Click demo landing page with ?utm_campaign=dc-launch → session appears; submit form → conversion in funnel attributed to campaign
- [ ] TC-51 Import Mailchimp CSV → email CTR KPI updates; re-import does not duplicate
- [ ] TC-52 Import GA4 and Meta sample CSVs via wizard mapping
## Paid media
- [ ] TC-60 Line: budget 100k, spend 94k, 40% period left → BUDGET_OVERRUN insight/chip
- [ ] TC-61 Change billing INVOICED→PAID → paidDate set; unbilled spend decreases; audited
- [ ] TC-62 Variance heatmap colours match (spend−budget)/budget
- [ ] TC-63 INVOICED > 30 days → UNBILLED/overdue insight
## Feedback
- [ ] TC-70 Create NPS survey → QR → submit 3 with "support never answers" from phone → NPS updates; detractor listed with aspect customer service
- [ ] TC-71 CSAT survey % correct; MPI recomputes
- [ ] TC-72 Erase response by id → anonymised; audit ERASE
## Insights & recommendations
- [ ] TC-80 Feed shows ≥8 types on seed; evidence chips open underlying mention/metric
- [ ] TC-81 Recommendation [Create campaign] → campaign + lines prefilled with suggested budget
- [ ] TC-82 Dismiss insight persists
## Reports
- [ ] TC-90 Generate Weekly Exec → PDF with KPI table, sentiment chart, SoV, top insights, paid summary
- [ ] TC-91 Schedule Mondays 08:00 → job logged; recipients stored
## Admin & non-functional
- [ ] TC-100 Sources table shows last run + counts; Run now works for RSS
- [ ] TC-101 Audit log diffs for TC-21/61
- [ ] TC-102 Dashboard/wall/competitors <1.5s on full seed; wall smooth at 200 cards
- [ ] TC-103 All pages + survey at 390px
- [ ] TC-104 `docker compose up` clean clone → seeded in <5 min; demo runs with internet off (except RSS live note)
