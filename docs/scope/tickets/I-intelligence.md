# Epic I: Intelligence

7 tickets, 40 hours.

| ID | Title | Priority | Phase | Hours | Status |
|---|---|---|---|---|---|
| I-01 | Tier 1 lexicon sentiment | P0 | 2 | 8 | DONE (staging) |
| I-02 | LLM client with cache and fallback | P0 | 2 | 6 | TODO |
| I-03 | Tier 2 aspect sentiment | P0 | 2 | 5 | TODO |
| I-04 | Trend detector | P0 | 3 | 6 | TODO |
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

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 6h
- **Depends on:** F-07

**Acceptance criteria**

- [ ] Single server-only client for the Claude API
- [ ] Every call cached in ai_artifacts by kind and ref
- [ ] Timeouts and retry with backoff
- [ ] Template fallback when the key is unset or the call fails
- [ ] Never throws to callers
- [ ] Token usage logged
- [ ] No PII beyond the mention text sent

## I-03 Tier 2 aspect sentiment

- **Status:** TODO
- **Priority:** P0  **Phase:** 2  **Estimate:** 5h
- **Depends on:** I-01, I-02

**Acceptance criteria**

- [ ] Runs for NEG mentions, confidence under 0.4 or high-reach authors
- [ ] Returns label, aspects from the 9-item taxonomy and a summary
- [ ] Result cached
- [ ] Falls back to tier 1 with no error shown

## I-04 Trend detector

- **Status:** TODO
- **Priority:** P0  **Phase:** 3  **Estimate:** 6h
- **Depends on:** I-01

**Acceptance criteria**

- [ ] Daily term counts (hashtags, keywords, bigrams)
- [ ] Rising when today exceeds the 14 day mean by 2 SD and count is 10 or more
- [ ] Co-occurrence clustering into topics
- [ ] Unit test on a synthetic spike

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
