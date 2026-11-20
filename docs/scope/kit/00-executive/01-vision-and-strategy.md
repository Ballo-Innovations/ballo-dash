# Vision & Strategy (CEO)

## One sentence
**Lens** — one screen where Infratel's marketing and communications team sees how the brand is performing (social, web, email, paid media), what the market is saying about it and its competitors (listening + sentiment), what customers feel (CSAT/NPS), and what to do next (AI insights and campaign recommendations) — with crisis alerts before the phone rings.

## Why we win
Most teams will build a dashboard with pretty charts. The challenge's pain is *fragmentation* and the lack of *real-time sentiment, competitor, and feedback visibility*. Three things judges see in 60 seconds:
1. **Live social listening wall** with sentiment scoring per mention, share of voice vs competitors (ZAMTEL-like, Liquid-like, MTN-like fictional names), and a **crisis alert** firing on a negative spike — with the posts that caused it.
2. **Unified KPI dashboard** that reconciles social + web + email + **paid media (budget vs spend vs billing status)** — the one line nobody else will build.
3. **AI insight feed and campaign recommendations** with citations to the underlying data ("Negative sentiment on fibre outages up 3× in Kitwe; recommend proactive status campaign; est. reach 40k").

## Strategic bets
| Bet | Rationale |
|---|---|
| Connector architecture, honest data | Real X/Facebook/LinkedIn APIs are paid, slow to approve, and restricted. We build a connector interface with: live RSS/news ingest, CSV/JSON import for GA/Meta/Mailchimp exports, a first-party web tracker, native surveys, and a **realistic simulated social stream** for the demo. Stated on stage. |
| Two-tier sentiment | Fast local lexicon model for every mention (ms, offline) + LLM for aspect-level nuance on flagged/negative items, cached. Explainable, offline-safe. |
| Rules + LLM insights | Deterministic detectors (spike, trend, share-of-voice shift, NPS drop, budget overrun) generate insights; LLM writes the narrative and campaign recommendation with linked evidence. |
| Zambia-realistic content | Mentions in English with local flavour (place names, Bemba/Nyanja phrases, kwacha), realistic topics (fibre outages, data centre launch, pricing, customer service), fictional competitors. |

## Scope guardrails
**In:** every capability area in the PRD coverage matrix.
**Out:** posting/publishing to social, ad buying, email sending (we track campaigns, not send them), multi-tenancy, native apps.

## Success criteria
- Dry-run judging ≥ 90% 48h before submission.
- Demo < 8 min, zero manual DB edits, works offline (simulated stream + cached LLM).
- Every challenge bullet → visible screen or documented connector.
