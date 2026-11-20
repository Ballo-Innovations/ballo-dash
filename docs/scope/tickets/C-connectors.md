# Epic C: Connectors

10 tickets, 77 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| C-01 | Connector interface, registry and run logging | P0 | 2 | 6 | DONE (staging) |
| C-02 | Worker service on the Ballo backend server: scheduler and job runner | P0 | 2 | 8 | DONE (staging) |
| C-03 | Adapt existing Facebook Instagram LinkedIn and X integrations to the connector interface | P0 | 2 | 12 | TODO |
| C-04 | RSS and news connector with outlet reach table | P0 | 2 | 6 | DONE (staging) |
| C-05 | First-party web tracker: /t.js, /api/collect, sessionisation | P0 | 2 | 8 | TODO |
| C-06 | CSV import wizard: GA4, Meta, Mailchimp, X exports | P0 | 2 | 10 | DONE (staging) |
| C-07 | Keyword rules per brand (include and exclude) | P1 | 2 | 4 | DONE (staging) |
| C-08 | Sandbox data generator with scenarios | P0 | 2 | 10 | DONE (staging) |
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

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** C-01

**Acceptance criteria**

- [x] Feeds configured per company
- [x] Articles matched against brand and competitor keywords become NEWS mentions with outlet, headline and reach estimate
- [x] Duplicates skipped
- [x] Feed timeout or bad XML logs a failed run without crashing

**Notes:** ballo-dash-api `src/connectors/news` (parse, outlets, connector). A LIVE/NEWS source with `config.connector = "news"` and `config.feeds` (urls, or `{url, outlet, reach}`) polls RSS 2.0, RSS 1.0 and Atom every 10 minutes. Only articles naming a brand or competitor are kept (no self-brand fallback). Reach comes from the outlet table, overridable per feed, default 2,000. Ids are a hash of guid or link. Each feed has a timeout (15s default) and a 5 MB cap; a failing feed is logged and skipped, and the run fails only if every feed fails. Integration tests run against a local HTTP server. On staging since 2026-11-20 with Lusaka Times, News Diggers, TechCabal and ZNBC (ZNBC's certificate chain is incomplete, so it is logged as failed).

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

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 10h
- **Depends on:** C-01, F-12

**Acceptance criteria**

- [x] Upload, column mapping, preview, import into metric_points or mentions with sourceKind IMPORT
- [x] Re-importing the same file adds 0 rows
- [x] Bad rows reported with line numbers
- [x] 10 MB limit
- [x] Sample files in the repo

**Notes:** API (ballo-dash-api #34): `POST /api/imports/{ga4|meta|mailchimp|x}/preview` and `POST /api/imports/{type}` take the file as the body (gzipped by the browser), with mapping and date order in the query; capability `data.import` (ADMIN, MANAGER, ANALYST); behind `adminConsole` (`FEATURE_ADMIN_CONSOLE=true` set on the staging API). GA4, Meta and Mailchimp become daily metric points for the self brand (same-day rows add up, upserted); X posts become mentions keyed by post id. Each import is a run on a per-company IMPORT source. Web: `/admin/imports` wizard and a Data imports menu item. Sample files: API `samples/imports`, web `public/samples/imports` (downloadable from the wizard). Verified on staging 2026-11-20 in a browser: all four samples imported, re-import added 0, bad rows listed by line, oversized and non-CSV files refused, 375 to 1440 px in light and dark.

## C-07 Keyword rules per brand (include and exclude)

- **Status:** DONE (staging)
- **Priority:** P1  **Phase:** 2  **Estimate:** 4h
- **Depends on:** C-01

**Acceptance criteria**

- [x] Rules applied by the normaliser
- [x] Excluded matches are dropped
- [x] Unit tests for case, hashtags and phrase matching

**Notes:** ballo-dash-api `src/connectors/match-brand.ts`. `brands.keywords` are include rules, `brands.exclude_keywords` (migration 0010) exclude rules; editing them in the UI comes with B-01. Rules match whole words in any case, phrases across spaces and dashes, and hashtags (`zed net` matches `#ZedNet`; `#zednet` matches only the hashtag). An excluded match is dropped, not refiled under the self brand, and the runner also applies excludes when a connector chose the brand. Also fixed: names followed by punctuation or written as hashtags fell back to the self brand. Verified on staging 2026-11-20: with exclude rules AFCON and Chipolopolo, the deployed matcher drops the football article and keeps the other five.

## C-08 Sandbox data generator with scenarios

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 10h
- **Depends on:** C-01

**Acceptance criteria**

- [x] Deterministic generator with scenarios baseline, outage, positive launch and competitor price cut
- [x] Writes sourceKind SIMULATED only
- [x] Can only run in a company marked as sandbox
- [x] Same seed gives the same output

**Notes:** ballo-dash-api `src/connectors/simulator`. Source config `{ "connector": "simulator", "scenario": "outage", "seed": 42, "intervalMinutes": 5 }`. Posts are generated per minute from (seed, scenario, minute), so a window always gives the same rows. The runner refuses SIMULATED sources outside `companies.is_sandbox` companies and any connector whose kind differs from its source. `npm run sim:backfill -- --company <id> --scenario <id> --days <1-30>` fills history (it never sets the sandbox flag). Volume guide: outage is about 7,500 posts a day, baseline about 1,900. Staging QA company is a sandbox with 14 days of baseline.

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
