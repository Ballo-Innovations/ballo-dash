# Judging Strategy — Platinum

| Criterion (assumed) | How we max it | On stage |
|---|---|---|
| Problem fit 20% | Nav mirrors challenge sections: Dashboard · Listening · Feedback · Campaigns · Paid Media · Competitors · Reports · Insights · Admin | Coverage matrix slide |
| Completeness 20% | All four capability areas working; data sources via connectors (live + import + simulated) | Clickthrough |
| Innovation 20% | Crisis detection with evidence; aspect-level sentiment; AI campaign recommendations with projected impact | Trigger a crisis live |
| Technical quality 15% | Streaming ingest pipeline, idempotent connectors, tests, CI, OpenAPI, scheduled reports | Repo tour |
| UX 10% | One design system; real-time wall; one-click PDF report | Judges click |
| Presentation 10% | Story: noise → signal → action | Rehearsed ×3 |
| Viability 5% | Connector roadmap with real API names and costs; data-protection section | One slide |

## Tactics
1. **Open the pitch on a crisis.** Simulated outage spike → alert → the posts → recommended response. Then rewind to show the calm dashboard.
2. **Show provenance everywhere.** Every KPI card has a source chip (Live / Import / Simulated).
3. **Reports that leave the app.** One-click weekly PDF + scheduled email — "reporting efficiency" is a stated impact.
4. **Pre-empt "where's the real Twitter data?"** Connector slide: live RSS now; X/Meta/LinkedIn connectors stubbed against official API shapes; CSV import works today for all of them.
5. Dry-run judging 48h before; fix lowest row.
