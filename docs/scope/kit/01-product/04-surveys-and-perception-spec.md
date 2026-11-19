# Surveys, Feedback & Market Perception Spec

## Survey builder
Types: **CSAT** (1–5 after interaction), **NPS** (0–10 relational), **Perception** (Likert 1–5 on attributes: reliable, innovative, affordable, customer-focused, trusted). Questions: scale, single-choice, free text. Settings: title, intro, logo, language (EN; placeholders for Bemba/Nyanja), channel tag (web, SMS link, email, QR at event), region field.
Public page `/s/[slug]`, mobile-first, 30-second completion, thank-you screen. QR code generated for events.

## Scoring
- CSAT % = responses ≥4 / total. NPS = %promoters(9–10) − %detractors(0–6).
- Verbatims run through sentiment tier 1 + aspect pass; aggregated to topics.
- **Market Perception Index (MPI)** 0–100 = 0.4·sentimentIndex(norm) + 0.3·NPS(norm) + 0.3·perceptionAttributes(mean norm). Trend by month and region; attribute radar vs competitors (competitor perception from listening sentiment aspects only — stated as such).

## Feedback dashboard
NPS gauge + trend; CSAT by channel; detractor verbatims with aspect tags; response volume; MPI trend + radar; "closed-loop" list: detractors flagged for follow-up with status.

## Data protection
Responses anonymous by default; optional contact field with consent checkbox; export/erase by response id.
