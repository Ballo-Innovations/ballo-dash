# Epic A: Analytics

4 tickets, 30 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| A-01 | KPI service and definitions | P0 | 3 | 8 | TODO |
| A-02 | Unified dashboard page | P0 | 3 | 10 | TODO |
| A-03 | Web analytics: sessions, sources, goals, funnel | P0 | 3 | 8 | TODO |
| A-04 | Period comparison and timezone handling across all metrics | P1 | 3 | 4 | TODO |

## A-01 KPI service and definitions

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** F-05, F-09
- **Feature flag:** `NEXT_PUBLIC_FEATURE_KPI_DASHBOARD`

**Acceptance criteria**

- [ ] Reach, engagement rate, follower growth, sessions, conversions, email CTR, mentions, sentiment index, share of voice, NPS, CSAT and paid variance per kit definitions
- [ ] Each returns value, change vs prior period, target, sparkline and sourceKind
- [ ] Targets editable per company
- [ ] Unit tests per formula

## A-02 Unified dashboard page

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 10h
- **Depends on:** A-01, F-12
- **Feature flag:** `NEXT_PUBLIC_FEATURE_KPI_DASHBOARD`

**Acceptance criteria**

- [ ] KPI strip with source chips and definitions
- [ ] Sentiment and mentions chart
- [ ] Share of voice donut
- [ ] Channel mix
- [ ] Paid media budget vs spend vs billing bars
- [ ] Insights panel
- [ ] Replaces the current /dashboard only when the flag is on
- [ ] Under 1.5 s on 50k mentions
- [ ] All five widths in both themes

## A-03 Web analytics: sessions, sources, goals, funnel

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** C-05
- **Feature flag:** `NEXT_PUBLIC_FEATURE_KPI_DASHBOARD`

**Acceptance criteria**

- [ ] Goals by pageview path, form submit or custom event
- [ ] Funnel sessions to leads to qualified to customer with step rates
- [ ] Last-touch attribution by UTM
- [ ] Unit tests for sessionisation and rates

## A-04 Period comparison and timezone handling across all metrics

- **Status:** TODO
- **Priority:** P1  **Phase:** 3  **Estimate:** 4h
- **Depends on:** A-01

**Acceptance criteria**

- [ ] Day, week, month and quarter with prior-period change
- [ ] Company timezone applied consistently
- [ ] Tested at month boundaries
