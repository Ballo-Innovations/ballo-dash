# Epic F: Foundations

13 tickets, 65 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| F-01 | Feature flag helper isFeatureEnabled | P0 | 1 | 2 | DONE (staging) |
| F-02 | Extend roles to ADMIN MANAGER ANALYST MARKETER COMMS READONLY | P0 | 1 | 4 | DONE (staging) |
| F-03 | Audit log table and withAudit wrapper | P0 | 1 | 5 | TODO |
| F-04 | Drizzle schema v2: brands and sources | P0 | 1 | 4 | TODO |
| F-05 | Drizzle schema v2: mentions topics metric_points | P0 | 1 | 5 | TODO |
| F-06 | Drizzle schema v2: web events, goals, campaigns, media plan lines | P0 | 1 | 4 | TODO |
| F-07 | Drizzle schema v2: surveys, alerts, insights, recommendations, forecasts, reports, ai_artifacts | P0 | 1 | 5 | TODO |
| F-08 | Tenant isolation guard and tests | P0 | 1 | 6 | TODO |
| F-09 | Helpers: money, dates, period ranges | P0 | 1 | 4 | TODO |
| F-10 | New sidebar navigation in the existing template shell | P0 | 1 | 5 | TODO |
| F-11 | Top bar: period picker, brand filter, alert bell | P0 | 1 | 6 | TODO |
| F-12 | Shared components: KpiCard, SourceChip, SentimentPill, Drawer, SeriesChart, DataTable, skeletons, empty and error states | P0 | 1 | 10 | TODO |
| F-13 | Global search (Cmd+K) across mentions topics campaigns surveys | P2 | 5 | 5 | TODO |

## F-01 Feature flag helper isFeatureEnabled

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 1  **Estimate:** 2h
- **Depends on:** H-08

**Acceptance criteria**

- [x] NEXT_PUBLIC_FEATURE_* flags
- [x] Unset means on in development and off elsewhere
- [x] Server and client helpers
- [x] Nav items, pages and API routes can be gated by one call
- [x] Tests for both defaults

**Notes:** Web: `isFeatureEnabled` / `isFeatureEnabledOnServer`, `withFeature(name, Page)` and `<FeatureGate>` (404 while off), `feature` on nav items (Header filters with `withEnabledFeatures`). API: `@RequireFeature(name)` with `FEATURE_*` variables, 404 while off.

## F-02 Extend roles to ADMIN MANAGER ANALYST MARKETER COMMS READONLY

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 1  **Estimate:** 4h
- **Depends on:** H-12

**Acceptance criteria**

- [x] Enum migration adds MARKETER, COMMS, READONLY and maps existing CLIENT users to READONLY
- [x] RequireRole helper
- [x] Capability matrix from kit 02-architecture/05 encoded in one module with a table-driven test for all 6 roles

**Notes:** API: migration 0002, `@RequireRole`, matrix in `src/common/rbac.ts`. Web: `src/lib/roles.ts` labels the six roles.

## F-03 Audit log table and withAudit wrapper

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 5h
- **Depends on:** H-12

**Acceptance criteria**

- [ ] Audit_logs table (company, actor, entity, entityId, action, before, after, at)
- [ ] WithAudit writes a diff row in the same transaction as the change
- [ ] Test proves a failed write leaves no audit row

## F-04 Drizzle schema v2: brands and sources

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 4h
- **Depends on:** none

**Acceptance criteria**

- [ ] Brands (companyId, name, isSelf, handles, keywords, color), sources and connector_runs tables with companyId on each
- [ ] One self brand created per existing company by the migration
- [ ] Migration runs clean on a copy of current data

## F-05 Drizzle schema v2: mentions topics metric_points

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 5h
- **Depends on:** F-04

**Acceptance criteria**

- [ ] Tables per kit schema with companyId, sourceKind enum (LIVE IMPORT SIMULATED STUB), unique (companyId, externalId) on mentions, unique (brand, channel, metric, date, campaign) on metric_points, indexes on (brandId, occurredAt), (sentiment, occurredAt), (channel, occurredAt)

## F-06 Drizzle schema v2: web events, goals, campaigns, media plan lines

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 4h
- **Depends on:** F-04

**Acceptance criteria**

- [ ] Tables per kit schema with companyId
- [ ] Money stored as integer minor units with the currency on the company
- [ ] Billing status enum PLANNED BOOKED INVOICED PAID DISPUTED

## F-07 Drizzle schema v2: surveys, alerts, insights, recommendations, forecasts, reports, ai_artifacts

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 5h
- **Depends on:** F-04

**Acceptance criteria**

- [ ] Tables per kit schema with companyId
- [ ] Survey slug unique globally
- [ ] Alert evidence stored as mention ids
- [ ] All foreign keys and cascade rules defined

## F-08 Tenant isolation guard and tests

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 6h
- **Depends on:** F-04, F-05, F-06, F-07

**Acceptance criteria**

- [ ] Every query helper takes companyId from the session, never from the request
- [ ] Integration test creates two companies and proves each list, detail and write endpoint returns 404 or empty for the other company's ids

## F-09 Helpers: money, dates, period ranges

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 4h
- **Depends on:** none

**Acceptance criteria**

- [ ] FormatMoney (minor units, company currency, ZMW default), UTC storage with company timezone display (Africa/Lusaka default), day/week/month/quarter ranges with prior-period comparison
- [ ] Unit tests including month and DST boundaries

## F-10 New sidebar navigation in the existing template shell

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 5h
- **Depends on:** F-01, F-02

**Acceptance criteria**

- [ ] MenuData replaced with Dashboard, Listening, Media, Competitors, Campaigns, Paid Media, Feedback, Insights, Reports, Admin using the template's pc-sidebar and Phosphor icons
- [ ] Items hidden by role and by flag
- [ ] Existing Data and Statistics pages kept under a Social group
- [ ] Works in light and dark theme and at 375px

## F-11 Top bar: period picker, brand filter, alert bell

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 6h
- **Depends on:** F-10

**Acceptance criteria**

- [ ] 7d/30d/90d/custom period and brand filter stored in the URL and shared by all pages
- [ ] Bell shows the open alert count
- [ ] Built from the template's Topbar and dropdown styles
- [ ] Keyboard accessible

## F-12 Shared components: KpiCard, SourceChip, SentimentPill, Drawer, SeriesChart, DataTable, skeletons, empty and error states

- **Status:** TODO
- **Priority:** P0  **Phase:** 1  **Estimate:** 10h
- **Depends on:** F-10

**Acceptance criteria**

- [ ] Built on template cards, badges, react-bootstrap Offcanvas and ApexCharts
- [ ] SeriesChart supports a dashed forecast line with a band
- [ ] Semantic colour tokens for sentiment, alert severity, billing status and source kind added to the SCSS variables for both themes with AA contrast
- [ ] A /dev/components page renders every component in every state

## F-13 Global search (Cmd+K) across mentions topics campaigns surveys

- **Status:** TODO
- **Priority:** P2  **Phase:** 5  **Estimate:** 5h
- **Depends on:** L-01, P-01, S-01

**Acceptance criteria**

- [ ] Opens from keyboard and top bar
- [ ] Results grouped by type and scoped to the company
- [ ] Arrow keys and Enter navigate
