# Epic P: Campaigns and paid media

6 tickets, 39 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| P-01 | Campaigns list and detail with email metrics and UTM attribution | P0 | 3 | 8 | TODO |
| P-02 | Media plan lines with inline editing | P0 | 3 | 8 | TODO |
| P-03 | Paid media summary service | P0 | 3 | 6 | TODO |
| P-04 | Billing board, burn chart, variance heatmap, invoice list | P1 | 4 | 8 | TODO |
| P-05 | Paid media alert rules | P1 | 4 | 3 | TODO |
| P-06 | Paid spend import from Meta and Google Ads exports | P2 | 5 | 6 | TODO |

## P-01 Campaigns list and detail with email metrics and UTM attribution

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** F-06, A-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_CAMPAIGNS`

**Acceptance criteria**

- [ ] Create, edit and change status
- [ ] List shows channels, budget, spend, CTR or engagement
- [ ] Detail shows metric series, plan lines, sessions and conversions by UTM
- [ ] ADMIN, MANAGER and MARKETER can edit
- [ ] Audited

## P-02 Media plan lines with inline editing

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** P-01, F-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_PAID_MEDIA`

**Acceptance criteria**

- [ ] Channel, vendor, period, budget, actual spend, billing status, invoice ref and notes edited inline
- [ ] Validation (no negative money, end after start)
- [ ] Moving to INVOICED or PAID sets the date
- [ ] Concurrent edits do not silently overwrite
- [ ] Every change audited

## P-03 Paid media summary service

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 6h
- **Depends on:** P-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_PAID_MEDIA`

**Acceptance criteria**

- [ ] Variance (amount and percent), burn rate vs period elapsed, forecast end-of-period spend, unbilled spend and paid-but-unspent
- [ ] Rollups by campaign, channel, month and vendor
- [ ] Unit tests on every formula including zero budget

## P-04 Billing board, burn chart, variance heatmap, invoice list

- **Status:** TODO
- **Priority:** P1  **Phase:** 4  **Estimate:** 8h
- **Depends on:** P-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_PAID_MEDIA`

**Acceptance criteria**

- [ ] Board columns per billing status with drag to change (keyboard alternative provided)
- [ ] Heatmap colours follow variance with a text value so colour is not the only signal
- [ ] Invoices list with overdue marker

## P-05 Paid media alert rules

- **Status:** TODO
- **Priority:** P1  **Phase:** 4  **Estimate:** 3h
- **Depends on:** P-03, N-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_PAID_MEDIA`

**Acceptance criteria**

- [ ] Spend over 90% of budget with more than 30% of the period left
- [ ] INVOICED over 30 days unpaid
- [ ] Spend without BOOKED
- [ ] Each produces an insight and an inline chip

## P-06 Paid spend import from Meta and Google Ads exports

- **Status:** TODO
- **Priority:** P2  **Phase:** 5  **Estimate:** 6h
- **Depends on:** C-06, P-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_PAID_MEDIA`

**Acceptance criteria**

- [ ] Imported spend updates actual spend on matched lines
- [ ] Unmatched rows listed for manual mapping
- [ ] Idempotent
