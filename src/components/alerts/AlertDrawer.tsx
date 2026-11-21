import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  ErrorState,
  SentimentPill,
  SeverityBadge,
  Skeleton,
  Sparkline,
} from "@/components/ui";
import { useSession } from "@/contexts/SessionContext";
import { getJson, postJson, type ApiResult } from "@/lib/api-client";
import {
  alertSubject,
  canManageAlerts,
  describeChange,
  STATUS_LABEL,
  type AlertDetail,
} from "@/lib/alerts";
import { compact } from "@/lib/mentions";
import { formatDateTime } from "@/lib/periods";

async function send<T>(
  method: "POST" | "PATCH",
  url: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  if (method === "POST") return postJson<T>(url, body ?? {});
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok)
      return { ok: true, status: response.status, data: payload as T };
    return {
      ok: false,
      status: response.status,
      error: payload?.error ?? {
        code: "internal",
        message: "Something went wrong. Try again.",
      },
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        code: "network",
        message:
          "Could not reach the server. Check your connection and try again.",
      },
    };
  }
}

/**
 * The alert in full (L-06): severity, z, velocity, negative volume and reach, a 24 hour sparkline,
 * region, topic and aspect, the narrative, 5 evidence mentions, the recommended response (editable
 * by those who manage alerts), status actions, assignee and the timeline.
 */
export function AlertDrawer({
  id,
  onClose,
  onChanged,
  onOpenMention,
}: {
  id: string | null;
  onClose: () => void;
  onChanged: () => void;
  onOpenMention: (id: string) => void;
}) {
  const { data: session } = useSession();
  const manage = canManageAlerts(session?.user.role);
  const [result, setResult] = useState<{
    id: string;
    data?: AlertDetail;
    error?: string;
  } | null>(null);
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!id) return;
    let current = true;
    void getJson<AlertDetail>(`/api/alerts/${encodeURIComponent(id)}`).then(
      (r) => {
        if (!current) return;
        setResult(r.ok ? { id, data: r.data } : { id, error: r.error.message });
        if (r.ok) setDraft(null);
      },
    );
    return () => {
      current = false;
    };
  }, [id, version]);
  useEffect(() => {
    if (!id || !manage) return;
    void getJson<{ assignees: { id: string; name: string }[] }>(
      "/api/alerts/assignees",
    ).then((r) => r.ok && setAssignees(r.data.assignees));
  }, [id, manage]);

  const a = result && result.id === id ? result.data : undefined;
  const names = useMemo(
    () => new Map(assignees.map((p) => [p.id, p.name])),
    [assignees],
  );

  async function act(
    label: string,
    method: "POST" | "PATCH",
    url: string,
    body?: unknown,
  ) {
    setBusy(label);
    setProblem(null);
    const r = await send(method, url, body);
    setBusy(null);
    if (!r.ok) return setProblem(r.error.message);
    setVersion((v) => v + 1);
    onChanged();
    window.dispatchEvent(new Event("ballo:alerts-changed"));
  }

  const response = draft ?? a?.recommendedResponse ?? "";
  return (
    <Drawer
      show={id !== null}
      onClose={onClose}
      title={a ? `${a.brand.name}: ${alertSubject(a)}` : "Alert"}
      footer={
        a && manage ? (
          <div className="d-flex flex-wrap gap-2">
            {a.status === "OPEN" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!!busy}
                onClick={() =>
                  act("ack", "POST", `/api/alerts/${a.id}/acknowledge`)
                }
              >
                Acknowledge
              </button>
            )}
            {a.status !== "RESOLVED" && (
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                disabled={!!busy}
                onClick={() =>
                  act("resolve", "POST", `/api/alerts/${a.id}/resolve`)
                }
              >
                Resolve
              </button>
            )}
            {a.status !== "OPEN" && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={!!busy}
                onClick={() =>
                  act("reopen", "POST", `/api/alerts/${a.id}/reopen`)
                }
              >
                Reopen
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      {!result || result.id !== id ? (
        <div role="status" className="d-flex flex-column gap-2">
          <span className="visually-hidden">Loading alert</span>
          <Skeleton height={20} width="50%" />
          <Skeleton height={80} />
          <Skeleton height={120} />
        </div>
      ) : result.error || !a ? (
        <ErrorState
          message={result.error}
          onRetry={() => setVersion((v) => v + 1)}
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2 small">
            <SeverityBadge severity={a.severity} />
            <span className={`ui-pill alert-status-${a.status.toLowerCase()}`}>
              {STATUS_LABEL[a.status]}
            </span>
            <span className="text-muted">
              Opened {formatDateTime(a.openedAt)}
            </span>
          </div>
          {problem && (
            <div className="alert alert-danger py-2 mb-0" role="alert">
              {problem}
            </div>
          )}
          {a.narrative && <p className="mb-0">{a.narrative}</p>}

          <div role="region" aria-labelledby="alert-numbers">
            <h6 id="alert-numbers" className="mb-2">
              Numbers
            </h6>
            <div className="row g-2 text-center">
              {[
                ["Negative in 1 h", a.negVolume.toLocaleString("en")],
                ["z score", a.zScore.toFixed(1)],
                ["Velocity", `${a.velocity.toFixed(1)}x`],
                ["Negative reach", compact(a.reachNeg)],
              ].map(([label, value]) => (
                <div className="col-6" key={label}>
                  <div className="border rounded p-2">
                    <div className="ui-kpi-value fw-semibold">{value}</div>
                    <div className="small text-muted">{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2 mt-2 text-danger">
              <Sparkline
                values={a.hourly}
                width={220}
                height={36}
                label={`Negative mentions per hour over the last 24 hours, latest ${a.hourly[a.hourly.length - 1] ?? 0}`}
              />
              <span className="small text-muted">
                Negatives per hour, last 24 h
              </span>
            </div>
            <dl className="row small mb-0 mt-2">
              <dt className="col-4 fw-normal text-muted">Region</dt>
              <dd className="col-8">{a.region ?? "Not known"}</dd>
              <dt className="col-4 fw-normal text-muted">Topic</dt>
              <dd className="col-8">{a.topic ?? "None"}</dd>
              <dt className="col-4 fw-normal text-muted">Aspect</dt>
              <dd className="col-8">{a.aspect ?? "Not known"}</dd>
            </dl>
          </div>

          <div role="region" aria-labelledby="alert-response">
            <h6 id="alert-response" className="mb-2">
              Recommended response
            </h6>
            {manage ? (
              <>
                <label
                  htmlFor="alert-response-text"
                  className="visually-hidden"
                >
                  Recommended response
                </label>
                <textarea
                  id="alert-response-text"
                  className="form-control"
                  rows={4}
                  maxLength={2000}
                  value={response}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    disabled={
                      !!busy ||
                      draft === null ||
                      !draft.trim() ||
                      draft === a.recommendedResponse
                    }
                    onClick={() =>
                      act("save", "PATCH", `/api/alerts/${a.id}`, {
                        recommendedResponse: draft,
                      })
                    }
                  >
                    Save response
                  </button>
                  <button
                    type="button"
                    className="btn btn-link btn-sm"
                    onClick={() => {
                      void navigator.clipboard?.writeText(response).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </>
            ) : (
              <p className="mb-0 listening-text">{a.recommendedResponse}</p>
            )}
          </div>

          <div role="region" aria-labelledby="alert-assignee">
            <h6 id="alert-assignee" className="mb-2">
              Assignee
            </h6>
            {manage ? (
              <>
                <label htmlFor="alert-assign" className="visually-hidden">
                  Assignee
                </label>
                <select
                  id="alert-assign"
                  className="form-select form-select-sm"
                  value={a.assignee?.id ?? ""}
                  disabled={!!busy}
                  onChange={(e) =>
                    act("assign", "POST", `/api/alerts/${a.id}/assign`, {
                      userId: e.target.value || null,
                    })
                  }
                >
                  <option value="">No one</option>
                  {assignees.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className="mb-0">{a.assignee?.name ?? "No one"}</p>
            )}
          </div>

          <div role="region" aria-labelledby="alert-evidence">
            <h6 id="alert-evidence" className="mb-2">
              Evidence
            </h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {a.evidence.map((m) => (
                <li key={m.id} className="border rounded p-2">
                  <div className="d-flex align-items-center gap-2 small text-muted mb-1">
                    <SentimentPill sentiment={m.sentiment} />
                    <span className="text-truncate">
                      {m.outlet ??
                        m.author ??
                        (m.authorHandle ? `@${m.authorHandle}` : "Unknown")}
                    </span>
                    <span className="ms-auto">{compact(m.reach)} reach</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-start text-body text-decoration-none small"
                    onClick={() => onOpenMention(m.id)}
                  >
                    {m.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div role="region" aria-labelledby="alert-timeline">
            <h6 id="alert-timeline" className="mb-2">
              Timeline
            </h6>
            <ol className="list-unstyled small mb-0 alert-timeline">
              {!a.timeline.some((t) => t.action === "create") && (
                <li>
                  <span className="text-muted">
                    {formatDateTime(a.openedAt)}
                  </span>{" "}
                  Alert raised
                </li>
              )}
              {a.timeline
                .filter((t) => t.action !== "refresh")
                .map((t, i) => (
                  <li key={i}>
                    <span className="text-muted">{formatDateTime(t.at)}</span>{" "}
                    {describeChange(t, names)}
                  </li>
                ))}
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  );
}
