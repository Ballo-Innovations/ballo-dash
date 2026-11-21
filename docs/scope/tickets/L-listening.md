# Epic L: Listening

7 tickets, 42 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| L-01 | Mentions query service and list page with filters | P0 | 2 | 6 | DONE (staging) |
| L-02 | Live wall over server-sent events | P0 | 2 | 8 | TODO |
| L-03 | Mention drawer with explanation | P0 | 2 | 5 | TODO |
| L-04 | Rising topics panel and topic page | P0 | 3 | 5 | TODO |
| L-05 | Media page: news table, outlet ranking, coverage over time | P0 | 3 | 5 | TODO |
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

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 8h
- **Depends on:** L-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] New mention appears within 2 seconds
- [ ] Client keeps the last 200
- [ ] Reconnects with Last-Event-ID after a dropped connection
- [ ] Stream only carries the session company's data
- [ ] Smooth at 200 cards
- [ ] Served from a Vercel function, so the stream ends before the function duration limit and the client resumes without losing or repeating mentions

## L-03 Mention drawer with explanation

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 5h
- **Depends on:** L-01, I-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] Shows full text with matched terms highlighted, score, label, confidence, aspects, AI summary when present, source chip and link to the original

## L-04 Rising topics panel and topic page

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** I-04
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] Top 10 rising topics with z score, sparkline and example mentions
- [ ] Topic page lists its mentions

## L-05 Media page: news table, outlet ranking, coverage over time

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** C-04, L-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_LISTENING`

**Acceptance criteria**

- [ ] News mentions by outlet with headline, date, sentiment, reach estimate and brand
- [ ] Outlet ranking by reach
- [ ] Coverage chart

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
