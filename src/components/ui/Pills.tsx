/** Small coloured labels (F-12). Colours come from _semantic-tokens.scss and meet AA in both themes. */

export type Sentiment = "NEG" | "NEU" | "POS";
export type Severity = "WATCH" | "WARNING" | "CRISIS";
export type BillingStatus =
  "PLANNED" | "BOOKED" | "INVOICED" | "PAID" | "DISPUTED";
export type SourceKind = "LIVE" | "IMPORT" | "SIMULATED" | "STUB";

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  NEG: "Negative",
  NEU: "Neutral",
  POS: "Positive",
};
const SEVERITY_LABEL: Record<Severity, string> = {
  WATCH: "Watch",
  WARNING: "Warning",
  CRISIS: "Crisis",
};
const BILLING_LABEL: Record<BillingStatus, string> = {
  PLANNED: "Planned",
  BOOKED: "Booked",
  INVOICED: "Invoiced",
  PAID: "Paid",
  DISPUTED: "Disputed",
};
const SOURCE_LABEL: Record<SourceKind, { label: string; title: string }> = {
  LIVE: { label: "Live", title: "Fetched from the platform" },
  IMPORT: { label: "Import", title: "Imported from a file" },
  SIMULATED: { label: "Sim", title: "Simulated sample data" },
  STUB: { label: "Stub", title: "Placeholder until the source is connected" },
};

export function SentimentPill({
  sentiment,
  score,
}: {
  sentiment: Sentiment;
  score?: number;
}) {
  return (
    <span className={`ui-pill ui-sentiment-${sentiment.toLowerCase()}`}>
      {SENTIMENT_LABEL[sentiment]}
      {score !== undefined && (
        <span className="ui-kpi-value">
          {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
        </span>
      )}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`ui-pill ui-severity-${severity.toLowerCase()}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function BillingBadge({ status }: { status: BillingStatus }) {
  return (
    <span className={`ui-pill ui-billing-${status.toLowerCase()}`}>
      {BILLING_LABEL[status]}
    </span>
  );
}

/** Where a number came from. Shown next to every KPI. */
export function SourceChip({ kind }: { kind: SourceKind }) {
  const { label, title } = SOURCE_LABEL[kind];
  return (
    <span className={`ui-pill ui-source-${kind.toLowerCase()}`} title={title}>
      {label}
      <span className="visually-hidden">: {title}</span>
    </span>
  );
}
