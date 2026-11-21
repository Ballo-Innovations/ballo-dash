import { useEffect, useState } from "react";
import {
  CHANNEL_LABELS,
  SENTIMENTS,
  type ListeningFilters,
  type MentionOptions,
  type Sentiment,
} from "@/lib/mentions";

const SENTIMENT_NAMES: Record<Sentiment, string> = {
  NEG: "Negative",
  NEU: "Neutral",
  POS: "Positive",
};

/** Listening filters (L-01): sentiment chips with live counts, channel, topic, region and search. */
export function FilterBar({
  filters,
  options,
  counts,
  onChange,
}: {
  filters: ListeningFilters;
  options: MentionOptions | null;
  counts: Record<Sentiment, number> | null;
  onChange: (next: Partial<ListeningFilters>) => void;
}) {
  const [search, setSearch] = useState(filters.q);
  // Follow the URL when it changes from outside (back button, Clear filters).
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    setSearch(filters.q);
  }
  // Search after a short pause in typing.
  useEffect(() => {
    if (search.trim() === filters.q) return;
    const timer = setTimeout(() => onChange({ q: search.trim() }), 400);
    return () => clearTimeout(timer);
  }, [search, filters.q, onChange]);

  const toggle = (s: Sentiment) =>
    onChange({
      sentiment: filters.sentiment.includes(s)
        ? filters.sentiment.filter((x) => x !== s)
        : [...filters.sentiment, s],
    });
  const select = (
    key: "channel" | "topic" | "region",
    label: string,
    values: string[],
    names?: Record<string, string>,
  ) => (
    <div className="col-12 col-sm-4 col-xl-2">
      <label className="form-label small mb-1" htmlFor={`filter-${key}`}>
        {label}
      </label>
      <select
        id={`filter-${key}`}
        className="form-select form-select-sm"
        value={filters[key][0] ?? ""}
        onChange={(e) =>
          onChange({ [key]: e.target.value ? [e.target.value] : [] })
        }
      >
        <option value="">All</option>
        {Array.from(new Set([...filters[key], ...values])).map((v) => (
          <option key={v} value={v}>
            {names?.[v] ?? v}
          </option>
        ))}
      </select>
    </div>
  );
  const active =
    filters.sentiment.length +
    filters.channel.length +
    filters.topic.length +
    filters.region.length +
    (filters.q ? 1 : 0);

  return (
    <div className="card mb-3">
      <div className="card-body p-3">
        <div
          className="d-flex flex-wrap gap-2 mb-3"
          role="group"
          aria-label="Sentiment"
        >
          {SENTIMENTS.map((s) => {
            const on = filters.sentiment.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                className={`btn btn-sm ${on ? `listening-chip-on listening-chip-${s.toLowerCase()}` : "btn-outline-secondary"}`}
                onClick={() => toggle(s)}
              >
                {SENTIMENT_NAMES[s]}
                <span className="ms-1 fw-semibold">
                  {counts ? counts[s].toLocaleString("en") : "·"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="row g-2 align-items-end">
          <div className="col-12 col-xl-6">
            <label className="form-label small mb-1" htmlFor="filter-q">
              Search
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i
                  className="ph-duotone ph-magnifying-glass"
                  aria-hidden="true"
                />
              </span>
              <input
                id="filter-q"
                type="search"
                className="form-control"
                placeholder="Words in the post"
                value={search}
                maxLength={200}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {select(
            "channel",
            "Channel",
            options?.channels ?? [],
            CHANNEL_LABELS,
          )}
          {select("topic", "Topic", options?.topics ?? [])}
          {select("region", "Region", options?.regions ?? [])}
        </div>
        {active > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm px-0 mt-2"
            onClick={() => {
              setSearch("");
              onChange({
                sentiment: [],
                channel: [],
                topic: [],
                region: [],
                q: "",
              });
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
