# Data Connectors (honesty policy: every record carries sourceKind)

| Connector | Kind | What it does | Status for demo |
|---|---|---|---|
| **RSS/News** | LIVE | Polls Zambian/regional outlets' RSS (e.g. national dailies, tech blogs, Lusaka Times-style feeds — configure in Admin); keyword match brand/competitors; reach estimate per outlet table | Live on stage |
| **Web tracker** | LIVE | `/t.js` snippet on demo landing page; sessions, pageviews, UTM, goals | Live on stage (judge clicks page) |
| **Surveys** | LIVE | Native `/s/slug` | Live on stage (judge submits NPS from phone via QR) |
| **CSV imports** | IMPORT | GA4 export, Meta Insights export, Mailchimp campaign export, X analytics export → MetricPoints/Mentions; column-mapping wizard | Live import of sample files |
| **Simulated social stream** | SIMULATED | Generator with scenarios; realistic authors, handles, cities, hashtags, emoji | Primary listening data |
| **X / Meta / LinkedIn API** | STUB | Connector classes implementing the interface against official API response shapes; needs keys; disabled | Shown in code + roadmap |

Interface:
```ts
interface Connector { id: string; kind: SourceKind; channel: Channel;
  fetch(since: Date, cfg: Json): Promise<RawItem[]>; normalise(item: RawItem): Mention | MetricPoint; }
```
Scheduler: RSS every 10 min; simulated per scenario rate; imports on upload; stubs never.

## Simulated stream design
Scenario JSON: `{durationMin, ratePerMin, sentimentMix:{neg,neu,pos}, topics:[{name, weight, templates[]}], regions:[...], competitorShare}`. Templates with slots: `"Been without fibre in {city} since {time} ba {brand} 😤 #ZedNet"`. Author pool 400 handles with follower counts (long-tail + a few "verified" high reach). Deterministic seed for reproducible demos.

## Say on stage
"Three sources are live right now — news, our web tracker, and surveys. Social is simulated because platform APIs are paid and gated; the connectors are written against the real API shapes and switch on with a key."
