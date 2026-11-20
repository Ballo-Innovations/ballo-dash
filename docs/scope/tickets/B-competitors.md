# Epic B: Competitors

4 tickets, 21 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| B-01 | Competitor brands: create, edit, handles, keywords | P0 | 3 | 4 | TODO |
| B-02 | Benchmark service and table | P0 | 3 | 8 | TODO |
| B-03 | Share of voice by channel and period | P0 | 3 | 5 | TODO |
| B-04 | Top topics and sentiment comparison per brand | P1 | 4 | 4 | TODO |

## B-01 Competitor brands: create, edit, handles, keywords

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 4h
- **Depends on:** F-04
- **Feature flag:** `NEXT_PUBLIC_FEATURE_COMPETITORS`

**Acceptance criteria**

- [ ] Plan-limited number of competitors
- [ ] Changes audited
- [ ] Deleting a brand asks for confirmation and removes its data

## B-02 Benchmark service and table

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** A-01, B-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_COMPETITORS`

**Acceptance criteria**

- [ ] Followers, growth, engagement rate, posts per week, mentions, sentiment, share of voice and a 0 to 100 benchmark index per brand
- [ ] Unit tests
- [ ] Table with inline bars

## B-03 Share of voice by channel and period

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** B-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_COMPETITORS`

**Acceptance criteria**

- [ ] Donut, stacked bars by channel and trend lines
- [ ] Shares sum to 100%

## B-04 Top topics and sentiment comparison per brand

- **Status:** TODO
- **Priority:** P1  **Phase:** 4  **Estimate:** 4h
- **Depends on:** I-04, B-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_COMPETITORS`

**Acceptance criteria**

- [ ] Top topics per brand and a sentiment line per brand over the period
