# Epic M: Admin

6 tickets, 32 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| M-01 | Users and roles page | P0 | 3 | 5 | TODO |
| M-02 | Audit log page with diff | P0 | 3 | 4 | TODO |
| M-03 | Sources page | P0 | 3 | 5 | DONE (staging) |
| M-04 | Sandbox simulation page | P1 | 3 | 4 | TODO |
| M-05 | API keys and public REST API with OpenAPI | P1 | 5 | 10 | TODO |
| M-06 | Data protection settings and policy page | P1 | 5 | 4 | TODO |

## M-01 Users and roles page

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** F-02, F-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [ ] Invite, change role, deactivate
- [ ] ADMIN only
- [ ] Cannot remove the last admin
- [ ] Audited

## M-02 Audit log page with diff

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 4h
- **Depends on:** F-03
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [ ] Filter by entity, actor and date
- [ ] Before and after shown as a diff
- [ ] Paginated
- [ ] ADMIN only

## M-03 Sources page

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 3  **Estimate:** 5h
- **Depends on:** C-01, C-02
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [x] Table of sources with kind, last run, counts, status and error
- [x] Enable or disable
- [x] Run now
- [x] RSS feed and tracker site configuration

**Notes:** API (ballo-dash-api #78): `PATCH /api/sources/:id` (on/off, interval, news feeds), `POST /api/sources/:id/run` (shares the worker's lock), `POST /api/sources/news`, and `/api/tracker/sites` (list with events in 24 h, create with the embed tag on the web app's address, update). ADMIN and MANAGER; audited. Web `/admin/sources`: worker heartbeat, sources table (kind, cadence, last run with new and read counts and errors, on/off, Run now), news feed editor, tracker sites with copyable embed tag. The Admin menu entry is now a group with Sources. Found and fixed while testing: screen-reader text in source chips escaped the table's scroll box and widened the page by 400 px on phones (the shared DataTable had the same weakness). Verified on staging 2026-11-21.

## M-04 Sandbox simulation page

- **Status:** TODO
- **Priority:** P1  **Phase:** 3  **Estimate:** 4h
- **Depends on:** C-08
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [ ] Choose scenario and rate and inject
- [ ] Only visible in sandbox companies
- [ ] Action audited

## M-05 API keys and public REST API with OpenAPI

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 10h
- **Depends on:** H-12
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [ ] Keys shown once and stored hashed
- [ ] Bearer auth scoped to the company and a role
- [ ] Revoked key returns 401
- [ ] /api/v1 read endpoints per kit API spec
- [ ] OpenAPI document generated from the zod schemas

## M-06 Data protection settings and policy page

- **Status:** TODO
- **Priority:** P1  **Phase:** 5  **Estimate:** 4h
- **Depends on:** S-06
- **Feature flag:** `NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE`

**Acceptance criteria**

- [ ] Retention period for mentions and web events with a purge job
- [ ] Policy page
- [ ] Aligned with the Zambia Data Protection Act 2021 (legal review is decision D7)
