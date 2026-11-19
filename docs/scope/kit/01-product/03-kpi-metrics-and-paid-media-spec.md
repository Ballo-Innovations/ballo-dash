# KPI, Metrics & Paid Media Spec

## Unified KPI cards (dashboard strip) — each with value, Δ vs prior period, target, sparkline, source chip
| KPI | Definition | Source |
|---|---|---|
| Reach | Σ impressions across social + web sessions + email delivered | Social import/sim, tracker, email import |
| Engagement rate | (likes+comments+shares)/impressions | Social |
| Follower growth | Δ followers all networks | Social |
| Web sessions / conversions | tracker sessions; goal completions | First-party tracker (live) |
| Email CTR | clicks/delivered | Email import |
| Mentions | count brand mentions | Listening |
| Sentiment index | reach-weighted mean score, −100..100 | Listening |
| Share of voice | brand mentions / all tracked brands' mentions | Listening |
| NPS / CSAT | standard formulas | Surveys (live) |
| Paid media variance | (spend − budget)/budget | Paid media |

## Conversion tracking
Goals: `pageview` of `/thank-you`, `form_submit`, custom `event`. Funnel: sessions → leads (form) → qualified (manual flag) → customer (flag). Attribution: last-touch by UTM source/medium/campaign captured by tracker.

## First-party web tracker
`<script src="/t.js" data-site="infratel">` → POST `/api/collect` {event, path, referrer, utm, sessionId, ts}. Sessionisation 30 min. Demo site: a small static "Infratel" landing page served at `/demo-site` so judges can click and watch sessions appear.

## Paid media (Budget vs Spend vs Billing Status)
Entity **MediaPlanLine**: campaign, channel (Meta, Google, X, LinkedIn, Radio, Print, OOH, TV), period, **budget**, **actualSpend** (manual or import), **billingStatus** ∈ {PLANNED, BOOKED, INVOICED, PAID, DISPUTED}, invoiceRef, vendor, notes.
Derived: variance (ZMW and %), burn rate vs period elapsed, forecast end-of-period spend, "unbilled spend" (spent but not invoiced), "paid but unspent". Rollups per campaign, channel, month, vendor. Alert rules: spend > 90% budget with > 30% period left; INVOICED > 30 days not PAID; spend without BOOKED.
Views: plan table (editable), burn chart, billing status Kanban, variance heatmap, invoice list.

## Competitor benchmarking
Competitor entity with handles/keywords. Metrics side-by-side: followers, growth, engagement rate, posts/week, mentions, sentiment, share of voice, top topics. Benchmark index = normalised composite (0–100).

## Period handling
All metrics support day/week/month/quarter; comparison to prior period; Africa/Lusaka timezone.
