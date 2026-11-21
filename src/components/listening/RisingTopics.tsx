import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  EmptyState,
  ErrorState,
  SentimentPill,
  Skeleton,
  Sparkline,
} from "@/components/ui";
import { getJson } from "@/lib/api-client";
import { versusUsual, type Topic } from "@/lib/topics";

/** Rising topics panel (L-04): top 10 by z score, with a 15 day sparkline and example mentions. */
export function RisingTopics() {
  const router = useRouter();
  const [result, setResult] = useState<{
    topics?: Topic[];
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    void getJson<{ topics: Topic[] }>("/api/topics").then(
      (r) =>
        current &&
        setResult(
          r.ok ? { topics: r.data.topics } : { error: r.error.message },
        ),
    );
    return () => {
      current = false;
    };
  }, [attempt]);
  const keep = Object.fromEntries(
    Object.entries(router.query).filter(([k]) =>
      ["features", "brand"].includes(k),
    ),
  ) as Record<string, string>;

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center gap-2">
        <i className="ph-duotone ph-trend-up f-20" aria-hidden="true" />
        <h5 className="mb-0">Rising topics</h5>
      </div>
      {!result ? (
        <div className="card-body d-flex flex-column gap-3" role="status">
          <span className="visually-hidden">Loading rising topics</span>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={40} />
          ))}
        </div>
      ) : result.error ? (
        <ErrorState
          message={result.error}
          onRetry={() => {
            setResult(null);
            setAttempt((n) => n + 1);
          }}
        />
      ) : result.topics && result.topics.length === 0 ? (
        <EmptyState
          icon="ph-duotone ph-trend-up"
          title="Nothing is rising"
          message="Topics appear here when a term jumps well above its usual daily volume."
        />
      ) : (
        <ol className="list-unstyled mb-0 rising-topics">
          {result.topics?.map((t, i) => (
            <li key={t.id} className="px-3 py-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small" aria-hidden="true">
                  {i + 1}
                </span>
                <Link
                  href={{ pathname: `/listening/topics/${t.id}`, query: keep }}
                  className="fw-semibold text-truncate"
                >
                  {t.name}
                </Link>
                <span className="ms-auto text-primary">
                  <Sparkline
                    values={t.dailyCounts}
                    label={`${t.name}: mentions per day over 15 days, latest ${t.mentionCount}`}
                  />
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2 small text-muted mt-1">
                <span>{t.mentionCount.toLocaleString("en")} in 24 h</span>
                {versusUsual(t.dailyCounts) && (
                  <span>{versusUsual(t.dailyCounts)}</span>
                )}
                <span title="Standard deviations above the 14 day average">
                  z {t.score.toFixed(1)}
                </span>
              </div>
              {t.examples && t.examples.length > 0 && (
                <ul className="list-unstyled small mt-1 mb-0">
                  {t.examples.slice(0, 2).map((e) => (
                    <li
                      key={e.id}
                      className="d-flex gap-2 align-items-start mt-1"
                    >
                      <SentimentPill sentiment={e.sentiment} />
                      <span className="text-truncate-2">{e.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
