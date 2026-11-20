# Epic C: Connectors

10 tickets, 77 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| C-01 | Connector interface, registry and run logging | P0 | 2 | 6 | DONE (staging) |
| C-02 | Worker service on the Ballo backend server: scheduler and job runner | P0 | 2 | 8 | DONE (staging) |
| C-03 | Adapt existing Facebook Instagram LinkedIn and X integrations to the connector interface | P0 | 2 | 12 | TODO |
| C-04 | RSS and news connector with outlet reach table | P0 | 2 | 6 | TODO |
| C-05 | First-party web tracker: /t.js, /api/collect, sessionisation | P0 | 2 | 8 | TODO |
| C-06 | CSV import wizard: GA4, Meta, Mailchimp, X exports | P0 | 2 | 10 | TODO |
| C-07 | Keyword rules per brand (include and exclude) | P1 | 2 | 4 | TODO |
| C-08 | Sandbox data generator with scenarios | P0 | 2 | 10 | TODO |
| C-09 | TikTok and YouTube connectors | P2 | 5 | 10 | TODO |
| C-10 | Nightly materialisation of web sessions and conversions into metric_points | P1 | 3 | 3 | TODO |

## C-01 Connector interface, registry and run logging

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** F-04, F-05

**Acceptance criteria**

- [x] Connector { id, kind, channel, fetch(since, cfg), normalise(item) }
- [x] Runs write connector_runs with status, counts, duration and error
- [x] Batches of 500 or fewer
- [x] Re-running the same window inserts 0 new rows

**Notes:** ballo-dash-api `src/connectors` (types, registry, match-brand, runner). Mentions de-duplicate on (company, external id); metric points upsert. Integration tests with a fake connector cover run logging, re-run inserts 0, 1,234 items in batches, failures, and cross-company brand ids. On staging since 2026-11-20.

## C-02 Worker service on the Ballo backend server: scheduler and job runner

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 8h
- **Depends on:** C-01, K-10

**Acceptance criteria**

- [x] Node worker in this repo (shares the Drizzle schema and the intelligence code) runs as a managed service on the backend server, never on Vercel
- [x] Scheduled execution per source with a per-source lock so runs never overlap
- [x] Failures retried with backoff and visible in connector_runs
- [x] Restarts cleanly after a crash or reboot
- [ ] Heartbeat visible on the Sources page

**Notes:** ballo-dash-api `src/worker`: 30 second tick, per-source pg advisory lock, backoff doubling to a 6 hour cap, `worker_heartbeats`. Runs as the `worker` service in deploy/docker-compose.yml; deploy.sh starts it after the API. On staging: heartbeat fresh, and after killing the node process Docker restarted it. The heartbeat is served by GET /api/sources/health; the Sources page that shows it is built with the admin console (M epic).

## C-03 Adapt existing Facebook Instagram LinkedIn and X integrations to the connector interface

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 12h
- **Depends on:** C-01, H-04

**Acceptance criteria**

- [ ] The current live API fetchers write followers, impressions, engagement and posts to metric_points with sourceKind LIVE
- [ ] Brand posts and comments become mentions where the API allows
- [ ] Existing Data and Statistics pages keep working
- [ ] Idempotent on re-run
- [ ] Provider calls mocked in tests

## C-04 RSS and news connector with outlet reach table

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** C-01

**Acceptance criteria**

- [ ] Feeds configured per company
- [ ] Articles matched against brand and competitor keywords become NEWS mentions with outlet, headline and reach estimate
- [ ] Duplicates skipped
- [ ] Feed timeout or bad XML logs a failed run without crashing

## C-05 First-party web tracker: /t.js, /api/collect, sessionisation

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 8h
- **Depends on:** F-06, H-13

**Acceptance criteria**

- [ ] Snippet under 3 KB posts { event, path, referrer, utm, sessionId, ts } with a per-site public key
- [ ] 30 minute sessions
- [ ] Rate limited
- [ ] Rejects unknown site keys and oversized payloads
- [ ] Respects Do Not Track
- [ ] No cookies beyond a first-party session id

## C-06 CSV import wizard: GA4, Meta, Mailchimp, X exports

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 10h
- **Depends on:** C-01, F-12

**Acceptance criteria**

- [ ] Upload, column mapping, preview, import into metric_points or mentions with sourceKind IMPORT
- [ ] Re-importing the same file adds 0 rows
- [ ] Bad rows reported with line numbers
- [ ] 10 MB limit
- [ ] Sample files in the repo

## C-07 Keyword rules per brand (include and exclude)

- **Status:** TODO
- **Priority:** P1  **Phase:** 2  **Estimate:** 4h
- **Depends on:** C-01

**Acceptance criteria**

- [ ] Rules applied by the normaliser
- [ ] Excluded matches are dropped
- [ ] Unit tests for case, hashtags and phrase matching

## C-08 Sandbox data generator with scenarios

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 10h
- **Depends on:** C-01

**Acceptance criteria**

- [ ] Deterministic generator with scenarios baseline, outage, positive launch and competitor price cut
- [ ] Writes sourceKind SIMULATED only
- [ ] Can only run in a company marked as sandbox
- [ ] Same seed gives the same output

## C-09 TikTok and YouTube connectors

- **Status:** TODO
- **Priority:** P2  **Phase:** 5  **Estimate:** 10h
- **Depends on:** C-03

**Acceptance criteria**

- [ ] Follower, view and engagement metrics into metric_points for connected accounts
- [ ] Shown as STUB until credentials are approved

## C-10 Nightly materialisation of web sessions and conversions into metric_points

- **Status:** TODO
- **Priority:** P1  **Phase:** 3  **Estimate:** 3h
- **Depends on:** C-05, C-02

**Acceptance criteria**

- [ ] Daily sessions, pageviews and conversions per site written idempotently
- [ ] Backfill command for a date range
