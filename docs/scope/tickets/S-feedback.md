# Epic S: Feedback

6 tickets, 36 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| S-01 | Survey builder: CSAT, NPS, Perception | P0 | 4 | 8 | TODO |
| S-02 | Public survey page /s/[slug] | P0 | 4 | 6 | TODO |
| S-03 | Scoring: CSAT, NPS, verbatim sentiment | P0 | 4 | 4 | TODO |
| S-04 | Feedback dashboard | P0 | 4 | 8 | TODO |
| S-05 | Market Perception Index and radar | P1 | 4 | 6 | TODO |
| S-06 | Response export and erase | P0 | 4 | 4 | TODO |

## S-01 Survey builder: CSAT, NPS, Perception

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 8h
- **Depends on:** F-07
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] Title, intro, logo, questions (scale, single choice, free text), channel tag, region field
- [ ] Slug generated
- [ ] Share link and QR code
- [ ] Activate and deactivate
- [ ] ADMIN, MANAGER, ANALYST and MARKETER can create

## S-02 Public survey page /s/[slug]

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 6h
- **Depends on:** S-01, H-13
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] Mobile first, one question per screen, thank-you screen
- [ ] No login
- [ ] Rate limited
- [ ] Inactive or unknown slug shows a friendly page
- [ ] Contact field only stored with consent
- [ ] Works with JavaScript slow and on 375px
- [ ] Labelled inputs and keyboard operable

## S-03 Scoring: CSAT, NPS, verbatim sentiment

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 4h
- **Depends on:** S-02, I-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] CSAT = responses of 4 or more over total
- [ ] NPS = promoters minus detractors
- [ ] Verbatims scored with tier 1 and aspects
- [ ] Unit tests including empty and single-response cases

## S-04 Feedback dashboard

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 8h
- **Depends on:** S-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] NPS gauge and trend, CSAT by channel, response volume, detractor verbatims with aspects and follow-up status that can be updated

## S-05 Market Perception Index and radar

- **Status:** TODO
- **Priority:** P1  **Phase:** 4  **Estimate:** 6h
- **Depends on:** S-03, I-07
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] MPI = 0.4 sentiment + 0.3 NPS + 0.3 perception attributes, normalised to 0 to 100
- [ ] Trend by month and region
- [ ] Radar vs competitors labelled as listening-derived for competitors
- [ ] Unit tests

## S-06 Response export and erase

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 4h
- **Depends on:** S-02, F-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_FEEDBACK`

**Acceptance criteria**

- [ ] Export a response by id
- [ ] Erase anonymises contact and verbatim and writes an ERASE audit row
- [ ] ADMIN only
