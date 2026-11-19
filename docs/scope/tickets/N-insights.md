# Epic N: Insights

5 tickets, 37 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| N-01 | Insight detectors | P0 | 4 | 10 | TODO |
| N-02 | Insight feed page with narrative and dismiss | P0 | 4 | 6 | TODO |
| N-03 | Campaign recommendation engine | P0 | 4 | 8 | TODO |
| N-04 | Recommendation cards and Create campaign | P0 | 4 | 5 | TODO |
| N-05 | Forecasting | P1 | 4 | 8 | TODO |

## N-01 Insight detectors

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 10h
- **Depends on:** A-01, B-02, S-03, P-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_INSIGHTS`

**Acceptance criteria**

- [ ] 12 detector types from the kit spec as pure functions over arrays
- [ ] Each emits type, severity, title, evidence and metrics
- [ ] No duplicate insight for the same condition and period
- [ ] Unit tests per type on synthetic series

## N-02 Insight feed page with narrative and dismiss

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 6h
- **Depends on:** N-01, I-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_INSIGHTS`

**Acceptance criteria**

- [ ] Filter by type
- [ ] Each row shows severity, title, cached narrative with a so-what and 1 to 3 actions, and evidence chips that open the underlying mention or metric
- [ ] Dismiss persists and is audited

## N-03 Campaign recommendation engine

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 8h
- **Depends on:** N-01, P-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_INSIGHTS`

**Acceptance criteria**

- [ ] Rule table from the kit maps triggers to recommendations with rationale, channels, suggested budget, projected reach and sentiment impact as ranges, effort and status
- [ ] Unit tests per rule

## N-04 Recommendation cards and Create campaign

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 5h
- **Depends on:** N-03, P-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_INSIGHTS`

**Acceptance criteria**

- [ ] Create campaign pre-fills a draft campaign and plan lines with the suggested budget and links back to the recommendation
- [ ] Pressing twice does not create two campaigns

## N-05 Forecasting

- **Status:** TODO
- **Priority:** P1  **Phase:** 4  **Estimate:** 8h
- **Depends on:** A-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_INSIGHTS`

**Acceptance criteria**

- [ ] Holt-Winters with weekly seasonality when there are 8 or more weeks of data, otherwise linear regression
- [ ] 4 week horizon with an 80% band
- [ ] Shown as a dashed line on the dashboard charts
- [ ] Unit tests on synthetic series within tolerance
