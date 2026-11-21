# Epic I: Intelligence

7 tickets, 40 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| I-01 | Tier 1 lexicon sentiment | P0 | 2 | 8 | DONE (staging) |
| I-02 | LLM client with cache and fallback | P0 | 2 | 6 | DONE (staging) |
| I-03 | Tier 2 aspect sentiment | P0 | 2 | 5 | DONE (staging) |
| I-04 | Trend detector | P0 | 3 | 6 | DONE (staging) |
| I-05 | Crisis detector and recommended response templates | P0 | 3 | 8 | TODO |
| I-06 | Alert narrative from the LLM | P1 | 3 | 3 | TODO |
| I-07 | Sentiment aggregates by aspect, channel, region and topic | P0 | 3 | 4 | TODO |

## I-01 Tier 1 lexicon sentiment

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 8h
- **Depends on:** none

**Acceptance criteria**

- [x] Pure function returning score in [-1, 1], label with thresholds -0.15 and 0.15, confidence and matched terms
- [x] Domain, local-language and emoji lexicons
- [x] Negation and intensifiers
- [x] Lexicon editable per company
- [x] At least 40 table-driven test sentences including the kit's TC-11 and TC-12

**Notes:** ballo-dash-api `src/intelligence/sentiment` (#42). 223 built-in terms (general, telco, Nyanja and Bemba, emoji), phrases up to three words, negation within three words and intensifiers, neither crossing punctuation or "but". Company terms in `sentiment_terms` via `GET/PUT /api/sentiment/lexicon` (`company.edit`, audited; weight 0 switches a built-in term off). Mentions without sentiment are scored at ingest; `npm run sentiment:backfill` scores stored ones. The Nyanja and Bemba list needs a native speaker's review. On staging 2026-11-21: backfill scored 16 stored news and imported X mentions with sensible labels.

## I-02 LLM client with cache and fallback

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** F-07

**Acceptance criteria**

- [x] Single server-only client for the Claude API
- [x] Every call cached in ai_artifacts by kind and ref
- [x] Timeouts and retry with backoff
- [x] Template fallback when the key is unset or the call fails
- [x] Never throws to callers
- [x] Token usage logged
- [x] No PII beyond the mention text sent

**Notes:** ballo-dash-api `src/intelligence/llm` (#44), official `@anthropic-ai/sdk`, default model `claude-opus-5-5` (`ANTHROPIC_MODEL` overrides). Cached in `ai_artifacts` by company, kind and ref; 30s timeout with two retries; template fallback on no key, error, refusal or empty answer (failures are not cached); server-side refusal fallbacks on; usage logged as `usage.input/output/cacheRead`; emails and phone numbers redacted before sending. Staging has no `ANTHROPIC_API_KEY`, so it runs in fallback mode until one is added to `/var/apps/ballo-dash-staging/deploy/.env`.

## I-03 Tier 2 aspect sentiment

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 2  **Estimate:** 5h
- **Depends on:** I-01, I-02

**Acceptance criteria**

- [x] Runs for NEG mentions, confidence under 0.4 or high-reach authors
- [x] Returns label, aspects from the 9-item taxonomy and a summary
- [x] Result cached
- [x] Falls back to tier 1 with no error shown

**Notes:** ballo-dash-api `src/intelligence/aspects` (#46). Worker step: up to 10 recent (48h) mentions per tick that are NEG, under 0.4 confidence, or from authors with 10,000+ followers, verified, or 10,000+ reach. Structured output (JSON schema) gives label, aspects (9-item taxonomy, -1..1) and summary; cached in `ai_artifacts`. `mentions.aspects` is null until examined, `[]` when none or when tier 2 was unavailable. On staging 2026-11-21 (no API key): the worker examined 40 mentions in 90 seconds, all kept tier 1, no errors.

## I-04 Trend detector

- **Status:** DONE (staging)
- **Priority:** P0  **Phase:** 3  **Estimate:** 6h
- **Depends on:** I-01

**Acceptance criteria**

- [x] Daily term counts (hashtags, keywords, bigrams)
- [x] Rising when today exceeds the 14 day mean by 2 SD and count is 10 or more
- [x] Co-occurrence clustering into topics
- [x] Unit test on a synthetic spike

**Notes:** ballo-dash-api `src/intelligence/trends` (#66, #68). Every 15 minutes the worker counts hashtags, keywords and two-word phrases per mention in 15 rolling 24 hour windows (so a spike this morning is not compared with whole earlier days). Rising: latest window at least 10 and above the 14 window mean by 2 SD (z score; SD floor of 1). Rising terms that share mentions become topics (top 10), stored with their window counts, and their recent mentions are tagged. Words from the company's brand names and keywords are never trend terms (on staging a newly added competitor brand otherwise topped the list). Tuning note: busy, steady terms have a small SD, so the rule can flag small relative rises (on staging "bundle" at 1.1x its usual volume); a minimum lift could be added if that proves noisy.

## I-05 Crisis detector and recommended response templates

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 8h
- **Depends on:** I-01, C-02

**Acceptance criteria**

- [ ] Computes negative volume, z, velocity and negative reach per brand
- [ ] WATCH, WARNING and CRISIS thresholds per kit spec
- [ ] 60 minute cooldown per topic
- [ ] Alert stores 5 evidence mention ids and a response template per aspect
- [ ] Sandbox outage scenario raises CRISIS within 3 minutes
- [ ] Unit tests on synthetic series

## I-06 Alert narrative from the LLM

- **Status:** TODO
- **Priority:** P1  **Phase:** 3  **Estimate:** 3h
- **Depends on:** I-05, I-02

**Acceptance criteria**

- [ ] Two-sentence narrative cached per alert
- [ ] Identical on reload
- [ ] Template when the LLM is unavailable

## I-07 Sentiment aggregates by aspect, channel, region and topic

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 4h
- **Depends on:** I-01

**Acceptance criteria**

- [ ] Reach-weighted sentiment index per day and per dimension
- [ ] Bars on the Listening page
- [ ] Values match a SQL spot check
