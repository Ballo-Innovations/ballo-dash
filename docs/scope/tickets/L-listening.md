# Epic L: Listening

7 tickets, 42 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| L-01 | Mentions query service and list page with filters | P0 | 2 | 6 | DONE (staging) |
| L-02 | Live wall over server-sent events | P0 | 2 | 8 | DONE (staging) |
| L-03 | Mention drawer with explanation | P0 | 2 | 5 | DONE (staging) |
| L-04 | Rising topics panel and topic page | P0 | 3 | 5 | TODO |
| L-05 | Media page: news table, outlet ranking, coverage over time | P0 | 3 | 5 | DONE (staging) |
| L-06 | Alerts: banner, list, drawer, acknowledge, assign, resolve | P0 | 3 | 8 | TODO |
| L-07 | Alert delivery by email | P1 | 5 | 5 | TODO |

## L-01 Mentions query service and list page with filters

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** F-05, F-12
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [x] Filters for sentiment, channel, topic, region, brand and period combine
- [x] Server pagination
- [x] Counts match the list
- [x] Loading, empty and error states
- [x] Usable at 375px

**Notes:** API `GET /api/mentions` and `/api/mentions/options` (ballo-dash-api #48; index `mentions (company_id, occurred_at)`), behind `FEATURE_LISTENING` (set on the staging API). Web `/listening`: sentiment chips with counts (they leave out the sentiment filter, so each shows what choosing it gives), channel, topic and region menus, search, period and brand from the top bar; all in the URL; 25 per page from the server. Verified on staging 2026-11-21 with 27,156 mentions: chips add up to the total, Negative alone gives exactly its chip count, filters combine (Negative + X + region 327), empty state on no match, Clear filters, page 2 survives reload, no horizontal scroll at 375 to 1280 px in light and dark.

## L-02 Live wall over server-sent events

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 8h
- **Depends on:** L-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [x] New mention appears within 2 seconds
- [x] Client keeps the last 200
- [x] Reconnects with Last-Event-ID after a dropped connection
- [x] Stream only carries the session company's data
- [x] Smooth at 200 cards
- [x] Served from a Vercel function, so the stream ends before the function duration limit and the client resumes without losing or repeating mentions

**Notes:** `GET /api/stream` (ballo-dash-api #56, fixes #58, #60, #62) and web `/listening/live`. The stream is served by the API on the backend server (this repo owns no endpoints; Vercel forwards `/api/*`) rather than a Vercel function, and keeps the same constraint: each response lasts 25 seconds and ends; EventSource reconnects with Last-Event-ID, an exact cursor (insert time in microseconds and id), so nothing is lost or repeated. Polls and settles every 0.5 s. Through Vercel's proxy the stream arrives in about 4 KB blocks, so a 4 KB padding comment follows each batch; without it the last event waited for the next heartbeat. The page keeps the newest 200, batches arrivals per animation frame, skips off-screen cards with `content-visibility`, and can pause. Verified on staging 2026-11-21: backlog of 50, inserted mentions on the wall 0.8 to 1.3 s after commit, still live across stream ends with no duplicate ids, pause holds and releases, a burst of 250 leaves 200 cards, no horizontal scroll at 375 px.

## L-03 Mention drawer with explanation

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 5h
- **Depends on:** L-01, I-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [x] Shows full text with matched terms highlighted, score, label, confidence, aspects, AI summary when present, source chip and link to the original

**Notes:** API `GET /api/mentions/:id` (ballo-dash-api #50) adds matched terms, aspects and the tier 2 summary from `ai_artifacts`. Web: clicking a mention opens the drawer, linkable as `?mention=<id>`; matched terms are highlighted in the sentiment's colour (a negated or boosted label falls back to its last word). While testing on staging, simulated mentions turned out to carry the brand name as their matched term; fixed in ballo-dash-api #54 and the 27,180 stored rows corrected. Verified on staging 2026-11-21: highlights, label, score, confidence, reload keeps the drawer, Escape closes it, a news article shows its outlet and link, 375 px dark.

## L-04 Rising topics panel and topic page

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** I-04
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] Top 10 rising topics with z score, sparkline and example mentions
- [ ] Topic page lists its mentions

## L-05 Media page: news table, outlet ranking, coverage over time

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** C-04, L-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [x] News mentions by outlet with headline, date, sentiment, reach estimate and brand
- [x] Outlet ranking by reach
- [x] Coverage chart

**Notes:** API `GET /api/media/summary` (ballo-dash-api #64): totals, outlets ranked by summed reach estimate with sentiment split, articles per local day. Web `/media`: four KPIs, coverage chart (days without articles at 0), outlet ranking, article table (date, outlet, headline, sentiment, estimated reach, brand) paged, headline opens the mention drawer. Verified on staging 2026-11-21 with the live news feeds: 8 articles, 430K estimated reach, Lusaka Times then News Diggers; no horizontal page scroll at 375 to 1280 px in light and dark.

## L-06 Alerts: banner, list, drawer, acknowledge, assign, resolve

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** I-05, F-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] Banner while an alert is OPEN and never auto-dismisses
- [ ] Drawer shows severity, z, velocity, negative volume, reach, 24h sparkline, region, topic, 5 evidence mentions, editable recommended response and timeline
- [ ] ADMIN, MANAGER and COMMS can change status, others cannot
- [ ] Each change audited

## L-07 Alert delivery by email

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 5h
- **Depends on:** L-06
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] WARNING and CRISIS alerts emailed to configured recipients once per alert
- [ ] Delivery logged
- [ ] Failure does not block alert creation (needs an email provider, decision D6)
