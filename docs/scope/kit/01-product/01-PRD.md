# PRD — Lens

## Personas
| Persona | Goal | Screens |
|---|---|---|
| Head of Marketing & Comms (Natasha) | One view of brand performance; weekly exec report in one click | Dashboard, Reports, Insights |
| Comms / PR officer (Kondwani) | Catch issues before they trend; know what media says | Listening, Crisis alerts, Media |
| Digital marketer (Mwila) | Campaign performance, conversion, paid spend vs budget | Campaigns, Paid Media, Web |
| Customer insights analyst (Chisomo) | CSAT/NPS trends, perception, share of voice | Feedback, Competitors |
| Admin | Sources, users, roles, scheduled reports | Admin |

## Coverage matrix
| Challenge bullet | Feature | Module | Epic |
|---|---|---|---|
| Social media analytics integration | Connector per network (X, Facebook, LinkedIn, Instagram, TikTok): followers, reach, engagement, posts; CSV import + simulated live | Dashboard/Social | E2 |
| Website analytics integration | First-party tracker snippet (pageviews, sessions, sources, conversions) + GA4 CSV import | Web | E2 |
| Email campaign analytics | Campaign model: sends, opens, clicks, unsubscribes; Mailchimp CSV import | Campaigns | E2 |
| KPI dashboards | Unified KPI cards with targets, trend, source chip | Dashboard | E3 |
| Conversion tracking | Goal definitions + funnel (visit → lead → signup) across channels | Web/Campaigns | E3 |
| Competitor benchmarking | Competitor entities; followers/engagement/mentions/sentiment side-by-side | Competitors | E5 |
| Paid media tracking (Budget vs Spend vs Billing) | Media plan lines: channel, budget, actual spend, billing status, variance, invoices | Paid Media | E4 |
| Brand mention tracking | Mention stream (social, news, forums) with keyword rules | Listening | E1 |
| Competitor monitoring | Same stream for competitor keywords | Listening | E1/E5 |
| Sentiment analysis | Per-mention score (−1..1) + label + aspect tags; explain panel | Listening | E6 |
| Trend detection | Topic clustering (keyword/hashtag frequency vs baseline), rising topics | Listening | E6 |
| Crisis alerts | Spike detector: negative volume z-score + velocity; alert with evidence; acknowledge/resolve | Listening/Alerts | E6 |
| Media monitoring | RSS/news ingest (live), outlet, headline, reach estimate | Media | E1 |
| CSAT surveys | Survey builder (CSAT 1–5), public link, responses, trend | Feedback | E7 |
| NPS surveys | NPS 0–10, promoters/detractors, verbatims with sentiment | Feedback | E7 |
| Market perception tracking | Perception index = weighted sentiment across sources + NPS + survey perception Qs, by period/region | Feedback | E7 |
| Share of voice analytics | Mentions share per brand, by channel/period; trend | Competitors | E5 |
| Automated reporting dashboards | Report templates (weekly exec, monthly brand), PDF export, schedule | Reports | E8 |
| Automated insight generation | Rule detectors → insight feed with evidence links + LLM narrative | Insights | E6 |
| Sentiment scoring | See above; account-level + topic-level aggregates | Listening | E6 |
| Trend forecasting | Linear/seasonal forecast of mentions, sentiment, followers, NPS (next 4 weeks) with bands | Insights/Dashboard | E6 |
| Campaign recommendations | Rules: topic + sentiment + channel performance → recommended campaign with projected reach, budget suggestion | Insights | E6 |

## User stories
**P0**
- Comms officer sees a live mention wall with sentiment and can open any mention to see why it scored that way.
- A negative spike triggers a crisis alert with the top posts, affected topic/region, and a recommended response; officer acknowledges.
- Head of Marketing opens the dashboard: KPI strip (reach, engagement, web sessions, conversions, email CTR, NPS, sentiment, share of voice), each with source chip and trend.
- Digital marketer sees paid media plan: budget vs spend vs billing status per line with variance and invoice state.
- Analyst compares Infratel vs 3 competitors: followers, engagement, mentions, sentiment, share of voice.
- Analyst sends a CSAT/NPS survey link, responses flow in, NPS and verbatim sentiment update.
- Head of Marketing clicks "Generate weekly report" → PDF; schedules it for Mondays.
- Insights feed shows ≥6 insight types with evidence; campaign recommendation card with projected impact.

**P1** Trend forecasting chart; topic clusters; media outlet reach ranking; conversion funnel; data import wizard for CSVs.
**P2** Live X/Meta connector stubs; Slack/email alert delivery; perception by region map.

## Non-functional
Wall updates ≤2s via SSE; dashboard <1.5s on 50k mentions; offline demo; responsive 390px; all writes audited.
