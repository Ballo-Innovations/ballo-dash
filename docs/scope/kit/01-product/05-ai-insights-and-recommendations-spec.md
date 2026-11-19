# AI Insights, Forecasting & Campaign Recommendations Spec

## Insight detectors (deterministic; each emits Insight{type, severity, title, evidence[], metrics})
| Type | Condition |
|---|---|
| SENTIMENT_DROP | 7-day sentiment index down ≥ 15 points vs prior 7 days |
| SENTIMENT_RISE | up ≥ 15 |
| MENTION_SPIKE | daily mentions z ≥ 2 |
| RISING_TOPIC | trend detector output |
| SOV_SHIFT | share of voice ±5 pts vs prior period |
| COMPETITOR_SURGE | competitor mentions or engagement z ≥ 2 |
| NPS_DROP / CSAT_DROP | ≥ 8 pts / ≥ 10 pts month-over-month |
| CAMPAIGN_OUTPERFORM / UNDERPERFORM | CTR or engagement ±40% vs channel median |
| BUDGET_OVERRUN / UNBILLED_SPEND | paid media rules |
| CONVERSION_DROP | funnel step rate −25% |
| MEDIA_COVERAGE | ≥3 news articles in 24h on a topic |

## LLM narrative
Input: insight + evidence (≤10 mentions/rows) + brand context. Output: 2-sentence narrative + "so what" + 1–3 actions. Cached. Fallback template per type.

## Campaign recommendation engine
Rules map (aspect, sentiment direction, channel performance, calendar) → recommendation:
| Trigger | Recommendation | Projection |
|---|---|---|
| NEG spike on network reliability | Proactive status/transparency campaign (social + SMS to affected region) | reach = affected mentions' reach × 3; budget suggestion from channel CPM table |
| POS rise on data centre topic | Amplify: customer story + LinkedIn thought-leadership | reach from LinkedIn median |
| Competitor pricing surge | Value comparison content + retention offer | — |
| High email CTR on a topic | Scale topic to paid social | budget = top line × 1.5 |
| NPS detractors cite customer service | Service-recovery campaign + CSAT follow-ups | — |
| Rising local event topic | Event sponsorship / timely content | — |
Each recommendation: title, rationale (evidence links), channels, suggested budget (ZMW), projected reach & sentiment impact (rule-based ranges), effort, status (NEW → PLANNED → RUNNING → DONE); "Create campaign" button pre-fills a Campaign + MediaPlanLines.

## Forecasting
Metric series (mentions, sentiment, followers, sessions, NPS): Holt-Winters (weekly seasonality) if ≥ 8 weeks data else linear regression; horizon 4 weeks; 80% band; shown as dashed line. Implemented in `intelligence/forecast.ts` with unit tests on synthetic series.
