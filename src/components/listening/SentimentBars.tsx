import { useEffect, useState } from "react";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { useFilters } from "@/hooks/useFilters";
import { getJson } from "@/lib/api-client";
import { CHANNEL_LABELS } from "@/lib/mentions";
import {
  barGeometry,
  score100,
  type Bucket,
  type SentimentSummary,
} from "@/lib/sentiment-summary";

const TABS = [
  { key: "byAspect", label: "Aspect" },
  { key: "byChannel", label: "Channel" },
  { key: "byRegion", label: "Region" },
  { key: "byTopic", label: "Topic" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/** Reach-weighted sentiment by aspect, channel, region and topic (I-07), -100 to +100. */
export function SentimentBars() {
  const { filters, range } = useFilters();
  const url = `/api/sentiment/summary?${new URLSearchParams({ from: range.start.toISOString(), to: range.end.toISOString(), ...(filters.brand ? { brand: filters.brand } : {}) })}`;
  const [result, setResult] = useState<{
    url: string;
    data?: SentimentSummary;
    error?: string;
  } | null>(null);
  const [tab, setTab] = useState<TabKey>("byAspect");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    void getJson<SentimentSummary>(url).then(
      (r) =>
        current &&
        setResult(
          r.ok ? { url, data: r.data } : { url, error: r.error.message },
        ),
    );
    return () => {
      current = false;
    };
  }, [url, attempt]);

  const r = result && result.url === url ? result : null;
  const rows: Bucket[] = r?.data ? r.data[tab] : [];
  const label = (b: Bucket) =>
    tab === "byChannel" ? (CHANNEL_LABELS[b.key] ?? b.key) : b.key;

  return (
    <div className="card mt-3">
      <div className="card-header d-flex flex-wrap align-items-center gap-2">
        <h5 className="mb-0">Sentiment</h5>
        {r?.data && (
          <span
            className="ms-auto small text-muted"
            title="Reach-weighted average sentiment, from -100 to +100"
          >
            Overall{" "}
            <strong className="ui-kpi-value">
              {score100(r.data.overall.index)}
            </strong>
          </span>
        )}
      </div>
      <div className="card-body">
        <div
          className="btn-group btn-group-sm mb-3 w-100"
          role="group"
          aria-label="Group sentiment by"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`btn ${tab === t.key ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {r?.error ? (
          <ErrorState
            message={r.error}
            onRetry={() => {
              setResult(null);
              setAttempt((n) => n + 1);
            }}
          />
        ) : !r ? (
          <div role="status" className="d-flex flex-column gap-2">
            <span className="visually-hidden">Loading sentiment</span>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={18} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="ph-duotone ph-chart-bar-horizontal"
            title="Nothing to show"
            message={
              tab === "byAspect"
                ? "Aspects appear once the AI reading has looked at mentions."
                : "No mentions in this period."
            }
          />
        ) : (
          <ul
            className="list-unstyled mb-0 d-flex flex-column gap-2"
            aria-label={`Sentiment by ${TABS.find((t) => t.key === tab)?.label.toLowerCase()}`}
          >
            {rows.slice(0, 10).map((b) => {
              const g = barGeometry(b.index);
              return (
                <li key={b.key}>
                  <div className="d-flex justify-content-between small">
                    <span className="text-truncate me-2">{label(b)}</span>
                    <span className="text-nowrap">
                      <strong className="ui-kpi-value">
                        {score100(b.index)}
                      </strong>
                      <span className="text-muted">
                        {" "}
                        · {b.mentions.toLocaleString("en")}
                      </span>
                    </span>
                  </div>
                  <div className="sentiment-track" aria-hidden="true">
                    <span
                      className={`sentiment-bar sentiment-bar-${g.tone.toLowerCase()}`}
                      style={{ left: `${g.left}%`, width: `${g.width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
