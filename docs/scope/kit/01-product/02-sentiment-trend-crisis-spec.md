# Sentiment, Trend Detection & Crisis Alert Spec

## Sentiment (per mention)
**Tier 1 — local, instant, every mention.** Lexicon model (AFINN/VADER-style) extended with a custom lexicon file `sentiment-lexicon.json`:
- Telco/ICT domain: "outage" −3, "downtime" −3, "slow" −2, "fast" +2, "reliable" +3, "overpriced" −3, "affordable" +2, "excellent" +3, "refund" −1, "upgrade" +1
- Local phrases: "zikomo" +2, "natotela" +2, "ba Infratel" 0 (brand marker), "chabwino" +2, "iyi network" 0, "boma" 0
- Emoji weights; negation handling ("not reliable" → −3); intensifiers ("very").
Output: `score ∈ [−1,1]`, `label ∈ {NEG, NEU, POS}` (thresholds −0.15 / +0.15), `confidence` = |score| scaled, `matchedTerms[]` (for the explain panel).

**Tier 2 — LLM aspect pass.** Triggered for: label NEG, confidence < 0.4, or mention from a high-reach source. Returns `{label, aspects:[{aspect:"network reliability", sentiment:-0.8}], summary}`. Aspects taxonomy: network reliability · speed · pricing · customer service · billing · coverage · data centre · brand/corporate · security. Cached in `AiArtifact`; template fallback = tier 1 result.

**Aggregates:** sentiment index per day = mean(score) weighted by reach; per topic, per channel, per competitor, per region.

## Trend detection
- Tokenise mentions (hashtags, keywords, bigrams); daily counts per term.
- Baseline = 14-day rolling mean & SD. **Rising** if today > mean + 2·SD and count ≥ 10. Score = z.
- Cluster rising terms by co-occurrence into Topics; keep top 10; show sparkline and example mentions.

## Crisis alert
Every 5 minutes (and on each ingest batch in demo mode) compute for brand and each competitor:
```
neg_vol_1h       = count(NEG mentions, last 60 min)
baseline_neg     = mean/SD of neg per hour over last 7 days (same hour-of-day optional)
z                = (neg_vol_1h − mean) / SD
velocity         = neg_vol_last_15min / max(neg_vol_prev_15min, 1)
reach_neg        = Σ reach of NEG mentions last 60 min
```
Severity: **WATCH** if z ≥ 2 · **WARNING** if z ≥ 3 or velocity ≥ 3 · **CRISIS** if z ≥ 4 and reach_neg > 50k, or any mention from a verified/high-reach account with score < −0.6 and ≥20 shares.
Alert payload: severity, dominant topic/aspect, region (from geo tags / place names), top 5 evidence mentions, trend sparkline, recommended response (template per aspect + LLM narrative), status (OPEN → ACKNOWLEDGED → RESOLVED), assignee. Cooldown 60 min per topic.

## Demo trigger
Admin → Simulation → "Inject outage scenario (Kitwe, 40 mentions over 3 min)". Drives the opening demo beat.
