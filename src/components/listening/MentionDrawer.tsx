import { useEffect, useState } from "react";
import {
  Drawer,
  ErrorState,
  SentimentPill,
  Skeleton,
  SourceChip,
} from "@/components/ui";
import { getJson } from "@/lib/api-client";
import { highlight } from "@/lib/highlight";
import {
  CHANNEL_ICONS,
  CHANNEL_LABELS,
  compact,
  type Mention,
} from "@/lib/mentions";
import { formatDateTime } from "@/lib/periods";

export interface MentionDetail extends Mention {
  lang: string;
  matchedTerms: string[];
  aspects: { aspect: string; sentiment: number }[] | null;
  summary: string | null;
  summaryModel: string | null;
}

function signed(n: number): string {
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function aspectTone(s: number): "NEG" | "NEU" | "POS" {
  return s < -0.15 ? "NEG" : s > 0.15 ? "POS" : "NEU";
}

/**
 * Why a mention got its sentiment (L-03): the full text with the matched terms highlighted, the
 * score, label and confidence, the aspects and the AI summary when tier 2 ran, its source and a
 * link to the original.
 */
export function MentionDrawer({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const [result, setResult] = useState<{
    id: string;
    data?: MentionDetail;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let current = true;
    void getJson<MentionDetail>(`/api/mentions/${encodeURIComponent(id)}`).then(
      (r) => {
        if (current)
          setResult(
            r.ok ? { id, data: r.data } : { id, error: r.error.message },
          );
      },
    );
    return () => {
      current = false;
    };
  }, [id, attempt]);

  const ready = result && result.id === id;
  const m = ready ? result.data : undefined;
  const who = m
    ? (m.outlet ??
      m.author ??
      (m.authorHandle ? `@${m.authorHandle}` : "Unknown author"))
    : "";

  return (
    <Drawer
      show={id !== null}
      onClose={onClose}
      title={m ? who : "Mention"}
      footer={
        m?.url ? (
          <a
            className="btn btn-outline-primary btn-sm"
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the original{" "}
            <i
              className="ph-duotone ph-arrow-square-out ms-1"
              aria-hidden="true"
            />
          </a>
        ) : undefined
      }
    >
      {!ready ? (
        <div role="status" className="d-grid gap-2">
          <span className="visually-hidden">Loading mention</span>
          <Skeleton height={14} width="60%" />
          <Skeleton height={60} />
          <Skeleton height={14} width="40%" />
        </div>
      ) : result.error || !m ? (
        <ErrorState
          message={result.error}
          onRetry={() => {
            setResult(null);
            setAttempt((a) => a + 1);
          }}
        />
      ) : (
        <div className="d-grid gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
            <i
              className={`ph-duotone ${CHANNEL_ICONS[m.channel] ?? "ph-chat-circle"} f-18`}
              aria-hidden="true"
            />
            <span>{CHANNEL_LABELS[m.channel] ?? m.channel}</span>
            <span>{formatDateTime(m.occurredAt)}</span>
            <SourceChip kind={m.sourceKind} />
          </div>

          <section aria-labelledby="mention-text">
            <h6 id="mention-text" className="visually-hidden">
              Text
            </h6>
            {m.headline && <p className="fw-semibold mb-1">{m.headline}</p>}
            <p className="mb-0 listening-text">
              {highlight(m.text, m.matchedTerms).map((s, i) =>
                s.match ? (
                  <mark
                    key={i}
                    className={`listening-mark listening-mark-${m.sentiment.toLowerCase()}`}
                  >
                    {s.text}
                  </mark>
                ) : (
                  <span key={i}>{s.text}</span>
                ),
              )}
            </p>
          </section>

          <section aria-labelledby="mention-sentiment">
            <h6 id="mention-sentiment" className="mb-2">
              Sentiment
            </h6>
            <dl className="row small mb-0">
              <dt className="col-5 fw-normal text-muted">Label</dt>
              <dd className="col-7">
                <SentimentPill sentiment={m.sentiment} />
              </dd>
              <dt className="col-5 fw-normal text-muted">Score</dt>
              <dd className="col-7 ui-kpi-value">{signed(m.sentimentScore)}</dd>
              <dt className="col-5 fw-normal text-muted">Confidence</dt>
              <dd className="col-7 ui-kpi-value">
                {Math.round(m.confidence * 100)}%
              </dd>
              <dt className="col-5 fw-normal text-muted">Matched terms</dt>
              <dd className="col-7">
                {m.matchedTerms.length ? m.matchedTerms.join(", ") : "None"}
              </dd>
            </dl>
          </section>

          {(m.summary || (m.aspects && m.aspects.length > 0)) && (
            <section aria-labelledby="mention-ai">
              <h6 id="mention-ai" className="mb-2">
                AI reading
              </h6>
              {m.summary && <p className="mb-2">{m.summary}</p>}
              {m.aspects && m.aspects.length > 0 && (
                <ul
                  className="list-unstyled d-flex flex-wrap gap-2 mb-0"
                  aria-label="Aspects"
                >
                  {m.aspects.map((a) => (
                    <li
                      key={a.aspect}
                      className={`ui-pill ui-sentiment-${aspectTone(a.sentiment).toLowerCase()}`}
                    >
                      {a.aspect}{" "}
                      <span className="ui-kpi-value">
                        {signed(a.sentiment)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section aria-labelledby="mention-about">
            <h6 id="mention-about" className="mb-2">
              About
            </h6>
            <dl className="row small mb-0">
              <dt className="col-5 fw-normal text-muted">Brand</dt>
              <dd className="col-7">
                {m.brand.name}
                {!m.brand.isSelf && " (competitor)"}
              </dd>
              {(m.city || m.region) && (
                <>
                  <dt className="col-5 fw-normal text-muted">Place</dt>
                  <dd className="col-7">
                    {[m.city, m.region].filter(Boolean).join(", ")}
                  </dd>
                </>
              )}
              {m.authorFollowers != null && (
                <>
                  <dt className="col-5 fw-normal text-muted">Followers</dt>
                  <dd className="col-7">{compact(m.authorFollowers)}</dd>
                </>
              )}
              <dt className="col-5 fw-normal text-muted">Reach</dt>
              <dd className="col-7">{compact(m.reach)}</dd>
              <dt className="col-5 fw-normal text-muted">Engagement</dt>
              <dd className="col-7">
                {compact(m.likes)} likes, {compact(m.shares)} shares,{" "}
                {compact(m.comments)} comments
              </dd>
              {m.topics.length > 0 && (
                <>
                  <dt className="col-5 fw-normal text-muted">Topics</dt>
                  <dd className="col-7">
                    {m.topics.map((t) => `#${t}`).join(" ")}
                  </dd>
                </>
              )}
            </dl>
          </section>
        </div>
      )}
    </Drawer>
  );
}
