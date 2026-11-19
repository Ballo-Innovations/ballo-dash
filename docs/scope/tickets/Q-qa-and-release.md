# Epic Q: QA and release

7 tickets, 47 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| Q-01 | QA tester portal suites in ballo-backoffice | P0 | 5 | 8 | TODO |
| Q-02 | Playwright end-to-end suite for the core journeys | P0 | 5 | 10 | TODO |
| Q-03 | Accessibility pass | P0 | 5 | 8 | TODO |
| Q-04 | Responsive and theme pass | P0 | 5 | 6 | TODO |
| Q-05 | Performance pass | P1 | 5 | 6 | TODO |
| Q-06 | Security review | P0 | 5 | 6 | TODO |
| Q-07 | Production readiness report and launch checklist | P0 | 5 | 3 | TODO |

## Q-01 QA tester portal suites in ballo-backoffice

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 8h
- **Depends on:** none

**Acceptance criteria**

- [ ] One suite file per module in ballo-backoffice/lib/qaSuites/data with happy, negative and edge cases drawn from kit 05-qa/02-test-cases.md
- [ ] Each case declares requires for its flag
- [ ] New flags added to capabilities/flags.ts
- [ ] Qa-env-snapshot --cases checked
- [ ] Shipped by backoffice PR

## Q-02 Playwright end-to-end suite for the core journeys

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 10h
- **Depends on:** H-09, K-04

**Acceptance criteria**

- [ ] Login
- [ ] Inject crisis, alert, acknowledge
- [ ] Open mention explanation
- [ ] Edit billing status
- [ ] Submit survey and see NPS move
- [ ] Generate report PDF
- [ ] Runs in CI against the seeded sandbox

## Q-03 Accessibility pass

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 8h
- **Depends on:** Q-02

**Acceptance criteria**

- [ ] Axe scan on every new page with no serious or critical issues
- [ ] Keyboard walk-through of drawers, tables, board and survey
- [ ] Manual checks not done are listed

## Q-04 Responsive and theme pass

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 6h
- **Depends on:** Q-02

**Acceptance criteria**

- [ ] Every new page reviewed from screenshots at 375, 430, 768, 1280 and 1440 in light and dark
- [ ] Defects fixed and re-shot

## Q-05 Performance pass

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 6h
- **Depends on:** K-04

**Acceptance criteria**

- [ ] Dashboard, wall and competitors under 1.5 s server time on the full seed
- [ ] Query plans checked for the 5 heaviest queries
- [ ] Bundle size of new pages recorded against a budget

## Q-06 Security review

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 6h
- **Depends on:** F-08, K-07

**Acceptance criteria**

- [ ] Access control and tenant isolation re-tested by role and by company on every endpoint
- [ ] Public endpoints rate limited
- [ ] Dependency and secret scan clean
- [ ] Findings fixed or logged with impact

## Q-07 Production readiness report and launch checklist

- **Status:** TODO
- **Priority:** P0  **Phase:** 5  **Estimate:** 3h
- **Depends on:** Q-01, Q-02, Q-03, Q-04, Q-05, Q-06

**Acceptance criteria**

- [ ] Report in the QUALITY_ASSURANCE.md format with evidence per category and one verdict
- [ ] Flags to switch on per environment listed in order
