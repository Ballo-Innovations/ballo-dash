# Epic R: Reports

4 tickets, 22 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| R-01 | Assess the existing reports module and decide reuse | P0 | 4 | 3 | TODO |
| R-02 | Report templates: Weekly Executive and Monthly Brand | P0 | 4 | 5 | TODO |
| R-03 | PDF generation and storage | P0 | 4 | 8 | TODO |
| R-04 | Report schedule and email delivery | P1 | 5 | 6 | TODO |

## R-01 Assess the existing reports module and decide reuse

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 3h
- **Depends on:** none

**Acceptance criteria**

- [ ] Written note on what src/components/reports and /reports/[platform] already do, what the export button produces, and which parts the new templates reuse

## R-02 Report templates: Weekly Executive and Monthly Brand

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 5h
- **Depends on:** R-01, A-01
- **Feature flag:** `NEXT_PUBLIC_FEATURE_REPORTS_V2`

**Acceptance criteria**

- [ ] Section config per template
- [ ] Preview page in the existing report layout with KPI table, sentiment chart, share of voice, top insights and paid summary

## R-03 PDF generation and storage

- **Status:** TODO
- **Priority:** P0  **Phase:** 4  **Estimate:** 8h
- **Depends on:** R-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_REPORTS_V2`

**Acceptance criteria**

- [ ] Server-side PDF stored in the existing S3 bucket under the company prefix
- [ ] Download through a short-lived signed URL
- [ ] Another company cannot fetch it
- [ ] Snapshot test on the layout

## R-04 Report schedule and email delivery

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 6h
- **Depends on:** R-03, C-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_REPORTS_V2`

**Acceptance criteria**

- [ ] Weekly or monthly cadence with recipients
- [ ] Job generates and emails the PDF once per period
- [ ] History lists every run
- [ ] ADMIN, MANAGER and ANALYST only (needs an email provider, decision D6)
