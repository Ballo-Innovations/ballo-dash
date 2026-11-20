# Wireframes
## /dashboard
```
[Period ▾] [Brand: Infratel ▾]                          🔔 2   ⌘K
KPI strip: Reach LIVE/SIM | Engagement SIM | Followers SIM | Sessions LIVE | Conv LIVE | Email CTR IMPORT | Mentions SIM | Sentiment SIM | SoV SIM | NPS LIVE | Paid variance
+----------------------------------------+------------------------------+
| Sentiment index + mentions (dual axis,  | Insights feed                |
|  forecast band dashed)                  |  ⚠ Sentiment −18 (reliability)|
+----------------------------------------+  ↑ #DataCentreZM rising      |
| Share of voice donut | Channel mix bar |  $ Meta line 94% spent, 40% left|
+----------------------+-----------------+------------------------------+
| Paid media: Budget vs Spend vs Billing (stacked bars per campaign)     |
+-----------------------------------------------------------------------+
```
## /listening
Left: filters (sentiment, channel, topic, region, brand). Centre: Live wall (SSE) of MentionCards (author, handle, followers, text, pill, reach, time). Right: Rising topics + sentiment by aspect bars. Top: AlertBanner when OPEN alert. Mention click → Drawer: full text, matchedTerms highlighted, aspects, LLM summary, link.
## /alerts/[id] (drawer or page)
Severity header · stats (z, velocity, neg volume, reach) · sparkline 24h · region/topic/aspect · evidence mentions (5) · recommended response (editable) · [Acknowledge] [Assign] [Resolve] · timeline.
## /media
News table: outlet, headline, date, sentiment, reach est., brand; outlet ranking; coverage over time.
## /competitors
BenchmarkTable (brands × metrics with bars) · SoV by channel stacked · sentiment comparison lines · top topics per brand · benchmark index gauge.
## /campaigns and /campaigns/[id]
List with status, channels, budget, spend, CTR/engagement. Detail: metrics series, lines, attribution from UTM (sessions, conversions).
## /paid-media
Tabs: Plan table (inline edit budget/spend/billing) · Billing Kanban · Burn chart · Variance heatmap (campaign × channel) · Invoices. Alerts chips inline.
## /feedback
NPS gauge + trend · CSAT by channel · MPI trend · Perception radar (Infratel vs competitor sentiment aspects) · Detractor verbatims with aspects + follow-up status · [New survey] → builder → share link + QR.
## /s/[slug] (public, mobile)
Title · intro · one question per screen · submit · thank you.
## /insights
Feed with type filter; each row: severity, title, narrative, evidence chips (open mention/metric), dismiss. Recommendations tab: cards with channels, budget, projected reach, [Create campaign].
## /reports
Templates (Weekly Exec, Monthly Brand) · [Generate] → preview → PDF · Schedule (cadence, recipients) · History.
## /admin
Sources (table, run now, last run, counts) · Simulation (scenario, rate, [Inject]) · Imports wizard · Users & roles · Audit · API keys · Data protection.
