# Design System — Lens
Principles: real-time but calm; sentiment colour is the only loud colour; provenance always visible.
## Tokens
bg #0B1220 / surface #121A2B / border #22304A / text #E6EAF2 / muted #8B96AD / accent #0EA5E9 (cyan — "signal") · Sentiment: NEG #DC2626, NEU #64748B, POS #16A34A · Alert: WATCH #D97706, WARNING #EA580C, CRISIS #DC2626 (pulsing border) · Brand colours: Infratel accent; competitors #A855F7 #F59E0B #14B8A6 · Billing: PLANNED grey, BOOKED blue, INVOICED amber, PAID green, DISPUTED red.
Light mode via prefers-color-scheme. Dark first.
## Typography: Inter; JetBrains Mono for numbers/handles. 12/14/16/20/28; tabular-nums.
## Layout: left sidebar (Dashboard · Listening · Media · Competitors · Campaigns · Paid Media · Feedback · Insights · Reports · Admin); top bar: period picker (7d/30d/90d/custom), brand filter, ⌘K, alert bell with count. Right Drawer for mention/alert/insight detail.
## Components: KpiCard(sourceChip) · SourceChip(LIVE/IMPORT/SIM/STUB) · SentimentPill · MentionCard · LiveWall(SSE) · AlertBanner · AlertDrawer(evidence list, sparkline, response) · TopicCloud/RisingList · SeriesChart(with forecast band) · BenchmarkTable · ShareOfVoiceDonut · MediaPlanTable(inline edit) · BillingKanban · VarianceHeatmap · SurveyBuilder · SurveyPublicForm · NpsGauge · PerceptionRadar · InsightRow · RecommendationCard · ReportPreview.
## Micro-rules: every KPI has ⓘ definition; empty states have CTA; skeletons not spinners; toasts on writes; alerts never auto-dismiss.
