import { useCallback, useEffect, useState, type ReactElement } from "react";
import Head from "next/head";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
  SourceChip,
} from "@/components/ui";
import { useSession } from "@/contexts/SessionContext";
import { getJson, postJson, type ApiResult } from "@/lib/api-client";
import { CHANNEL_LABELS } from "@/lib/mentions";
import { formatDateTime } from "@/lib/periods";
import {
  ago,
  cadence,
  canRun,
  feedList,
  type FeedConfig,
  type Health,
  type SourceRow,
  type TrackerSite,
} from "@/lib/sources";

const MANAGERS = ["ADMIN", "MANAGER"];

async function patch<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const r = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const payload = await r.json().catch(() => null);
    if (r.ok) return { ok: true, status: r.status, data: payload as T };
    return {
      ok: false,
      status: r.status,
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

function RunStatus({ run }: { run: SourceRow["lastRun"] }) {
  if (!run) return <span className="text-muted">Not run yet</span>;
  const failed = run.status === "FAILED";
  return (
    <span>
      <span
        className={
          failed
            ? "text-danger fw-semibold"
            : run.status === "SUCCEEDED"
              ? "text-success"
              : "text-muted"
        }
      >
        {failed ? "Failed" : run.status === "SUCCEEDED" ? "OK" : "Running"}
      </span>
      <span
        className="text-muted small d-block"
        title={formatDateTime(run.startedAt)}
      >
        {ago(run.startedAt)}
        {!failed &&
          ` · ${run.itemsNew.toLocaleString("en")} new, ${run.itemsIn.toLocaleString("en")} read`}
      </span>
      {failed && run.error && (
        <span
          className="small text-danger d-block text-truncate-2"
          title={run.error}
        >
          {run.error}
        </span>
      )}
    </span>
  );
}

/** Editor for one news source's feeds. */
function FeedsEditor({
  source,
  onSaved,
}: {
  source: SourceRow;
  onSaved: () => void;
}) {
  const [feeds, setFeeds] = useState<FeedConfig[]>(() =>
    feedList(source.config),
  );
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = (i: number, next: Partial<FeedConfig>) =>
    setFeeds((list) => list.map((f, j) => (j === i ? { ...f, ...next } : f)));

  async function save() {
    setSaving(true);
    setProblem(null);
    const clean = feeds
      .filter((f) => f.url.trim())
      .map((f) => ({
        url: f.url.trim(),
        ...(f.outlet?.trim() ? { outlet: f.outlet.trim() } : {}),
        ...(f.reach ? { reach: f.reach } : {}),
      }));
    const r = await patch(`/api/sources/${source.id}`, { feeds: clean });
    setSaving(false);
    if (!r.ok) return setProblem(r.error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved();
  }

  return (
    <div className="mb-4">
      <h6 className="mb-2">{source.name}</h6>
      <div className="d-flex flex-column gap-2">
        {feeds.map((f, i) => (
          <div className="row g-2 align-items-center" key={i}>
            <div className="col-12 col-md-6">
              <label
                className="visually-hidden"
                htmlFor={`feed-url-${source.id}-${i}`}
              >
                Feed address
              </label>
              <input
                id={`feed-url-${source.id}-${i}`}
                className="form-control form-control-sm"
                placeholder="https://example.com/feed/"
                value={f.url}
                onChange={(e) => update(i, { url: e.target.value })}
              />
            </div>
            <div className="col-6 col-md-3">
              <label
                className="visually-hidden"
                htmlFor={`feed-outlet-${source.id}-${i}`}
              >
                Outlet name
              </label>
              <input
                id={`feed-outlet-${source.id}-${i}`}
                className="form-control form-control-sm"
                placeholder="Outlet (optional)"
                value={f.outlet ?? ""}
                onChange={(e) => update(i, { outlet: e.target.value })}
              />
            </div>
            <div className="col-4 col-md-2">
              <label
                className="visually-hidden"
                htmlFor={`feed-reach-${source.id}-${i}`}
              >
                Estimated readers
              </label>
              <input
                id={`feed-reach-${source.id}-${i}`}
                className="form-control form-control-sm"
                inputMode="numeric"
                placeholder="Reach"
                value={f.reach ?? ""}
                onChange={(e) =>
                  update(i, {
                    reach: e.target.value
                      ? Math.max(
                          0,
                          Number.parseInt(
                            e.target.value.replace(/\D/g, ""),
                            10,
                          ) || 0,
                        )
                      : undefined,
                  })
                }
              />
            </div>
            <div className="col-2 col-md-1 text-end">
              <button
                type="button"
                className="btn btn-link btn-sm text-danger p-0"
                aria-label={`Remove feed ${f.url || i + 1}`}
                onClick={() =>
                  setFeeds((list) => list.filter((_, j) => j !== i))
                }
              >
                <i className="ph-duotone ph-trash f-18" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {problem && (
        <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
          {problem}
        </div>
      )}
      <div className="d-flex gap-2 mt-2 align-items-center">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setFeeds((list) => [...list, { url: "" }])}
          disabled={feeds.length >= 50}
        >
          Add feed
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={saving}
        >
          Save feeds
        </button>
        {saved && (
          <span className="small text-success" role="status">
            Saved
          </span>
        )}
      </div>
      <p className="small text-muted mt-2 mb-0">
        Leave outlet and reach empty to use the built-in outlet table.
      </p>
    </div>
  );
}

function TrackerSites() {
  const [sites, setSites] = useState<TrackerSite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    void getJson<{ sites: TrackerSite[] }>("/api/tracker/sites").then((r) => {
      if (!current) return;
      if (r.ok) setSites(r.data.sites);
      else setError(r.error.message);
    });
    return () => {
      current = false;
    };
  }, [version]);

  async function add() {
    setProblem(null);
    const list = domains
      .split(/[\s,]+/)
      .map((d) => d.trim())
      .filter(Boolean);
    const r = await postJson("/api/tracker/sites", {
      name: name.trim(),
      domains: list,
    });
    if (!r.ok) return setProblem(r.error.message);
    setName("");
    setDomains("");
    setVersion((v) => v + 1);
  }
  async function toggle(site: TrackerSite) {
    const r = await patch(`/api/tracker/sites/${site.id}`, {
      enabled: !site.enabled,
    });
    if (!r.ok) return setProblem(r.error.message);
    setVersion((v) => v + 1);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Website tracker</h5>
      </div>
      <div className="card-body">
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => setVersion((v) => v + 1)}
          />
        ) : !sites ? (
          <SkeletonCard lines={2} label="Loading sites" />
        ) : (
          <>
            {sites.length === 0 && (
              <p className="text-muted">
                No sites yet. Add your website to see visits and conversions.
              </p>
            )}
            <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
              {sites.map((s) => (
                <li key={s.id} className="border rounded p-3">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <strong>{s.name}</strong>
                    <span className="small text-muted">
                      {s.domains.length ? s.domains.join(", ") : "Any domain"}
                    </span>
                    <span className="small text-muted">
                      · {(s.events24h ?? 0).toLocaleString("en")} events in 24 h
                    </span>
                    <div className="form-check form-switch ms-auto mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`site-${s.id}`}
                        checked={s.enabled}
                        onChange={() => void toggle(s)}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor={`site-${s.id}`}
                      >
                        {s.enabled ? "Collecting" : "Off"}
                      </label>
                    </div>
                  </div>
                  <label className="small text-muted" htmlFor={`embed-${s.id}`}>
                    Paste this into the page head:
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      id={`embed-${s.id}`}
                      className="form-control font-monospace"
                      readOnly
                      value={s.embed}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        void navigator.clipboard
                          ?.writeText(s.embed)
                          .then(() => {
                            setCopied(s.id);
                            setTimeout(() => setCopied(null), 2000);
                          })
                      }
                    >
                      {copied === s.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <h6>Add a site</h6>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1" htmlFor="site-name">
                  Name
                </label>
                <input
                  id="site-name"
                  className="form-control form-control-sm"
                  placeholder="Main website"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1" htmlFor="site-domains">
                  Domains (optional, comma separated)
                </label>
                <input
                  id="site-domains"
                  className="form-control form-control-sm"
                  placeholder="example.com, shop.example.com"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-100"
                  disabled={!name.trim()}
                  onClick={() => void add()}
                >
                  Add site
                </button>
              </div>
            </div>
            {problem && (
              <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
                {problem}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Sources (M-03): what feeds Ballo Dash, whether it is working, and its settings. */
function SourcesPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<{
    data?: Health;
    error?: string;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "danger";
    text: string;
  } | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let current = true;
    void getJson<Health>("/api/sources/health").then(
      (r) =>
        current &&
        setHealth(r.ok ? { data: r.data } : { error: r.error.message }),
    );
    const timer = window.setInterval(
      () =>
        void getJson<Health>("/api/sources/health").then(
          (r) => current && r.ok && setHealth({ data: r.data }),
        ),
      30_000,
    );
    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, [version]);

  if (session && !MANAGERS.includes(session.user.role?.toUpperCase()))
    return (
      <>
        <BreadcrumbItem mainTitle="Admin" subTitle="Sources" />
        <div className="card">
          <EmptyState
            icon="ph-duotone ph-lock"
            title="You cannot manage sources"
            message="Sources are managed by administrators and managers."
          />
        </div>
      </>
    );

  async function toggle(s: SourceRow) {
    setBusy(s.id);
    const r = await patch(`/api/sources/${s.id}`, { enabled: !s.enabled });
    setBusy(null);
    if (!r.ok) return setNotice({ tone: "danger", text: r.error.message });
    setNotice({
      tone: "success",
      text: `${s.name} ${s.enabled ? "turned off" : "turned on"}.`,
    });
    reload();
  }
  async function run(s: SourceRow) {
    setBusy(s.id);
    setNotice(null);
    const r = await postJson<{
      status: string;
      itemsIn: number;
      itemsNew: number;
      error: string | null;
    }>(`/api/sources/${s.id}/run`, {});
    setBusy(null);
    if (!r.ok) return setNotice({ tone: "danger", text: r.error.message });
    setNotice(
      r.data.status === "SUCCEEDED"
        ? {
            tone: "success",
            text: `${s.name} ran: ${r.data.itemsNew.toLocaleString("en")} new, ${r.data.itemsIn.toLocaleString("en")} read.`,
          }
        : {
            tone: "danger",
            text: `${s.name} failed: ${r.data.error ?? "unknown error"}`,
          },
    );
    reload();
  }

  const h = health?.data;
  const news = h?.sources.filter((s) => s.config.connector === "news") ?? [];
  return (
    <>
      <Head>
        <title>Sources | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Admin" subTitle="Sources" />
      {h && (
        <div
          className={`d-flex align-items-center gap-2 mb-3 ${h.worker.healthy ? "text-success" : "text-danger"}`}
          role="status"
        >
          <span
            className={`live-dot ${h.worker.healthy ? "worker-ok" : "worker-down"}`}
            aria-hidden="true"
          />
          <strong>
            {h.worker.healthy ? "Worker running" : "Worker not responding"}
          </strong>
          <span className="text-muted small">
            last heartbeat {ago(h.worker.lastSeenAt)}
          </span>
        </div>
      )}
      {notice && (
        <div
          className={`alert alert-${notice.tone} py-2`}
          role={notice.tone === "danger" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Sources</h5>
        </div>
        <div className="card-body">
          {health?.error ? (
            <ErrorState message={health.error} onRetry={reload} />
          ) : !h ? (
            <SkeletonCard lines={4} label="Loading sources" />
          ) : h.sources.length === 0 ? (
            <EmptyState
              icon="ph-duotone ph-plugs"
              title="No sources yet"
              message="Connect a social account, add news feeds below, or import a file."
            />
          ) : (
            <div className="table-responsive position-relative">
              <table className="table align-middle mb-0">
                <caption className="visually-hidden">
                  Sources with their last run
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Source</th>
                    <th scope="col">Kind</th>
                    <th scope="col">Runs</th>
                    <th scope="col">Last run</th>
                    <th scope="col">On</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {h.sources.map((s) => (
                    <tr key={s.id} className={s.enabled ? "" : "text-muted"}>
                      <td>
                        <strong>{s.name}</strong>
                        <span className="d-block small text-muted">
                          {CHANNEL_LABELS[s.channel] ?? s.channel}
                        </span>
                      </td>
                      <td>
                        <SourceChip kind={s.kind} />
                      </td>
                      <td className="small">{cadence(s.config, s.kind)}</td>
                      <td style={{ minWidth: "12rem" }}>
                        <RunStatus run={s.lastRun} />
                      </td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            aria-label={`${s.name} on`}
                            checked={s.enabled}
                            disabled={busy === s.id}
                            onChange={() => void toggle(s)}
                          />
                        </div>
                      </td>
                      <td className="text-end">
                        {canRun(s.kind) && (
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm text-nowrap"
                            disabled={busy !== null}
                            onClick={() => void run(s)}
                          >
                            {busy === s.id ? "Running" : "Run now"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">News feeds</h5>
        </div>
        <div className="card-body">
          {news.length === 0 ? (
            <NewSource onCreated={reload} />
          ) : (
            news.map((s) => (
              <FeedsEditor key={s.id} source={s} onSaved={reload} />
            ))
          )}
        </div>
      </div>

      <TrackerSites />
    </>
  );
}

function NewSource({ onCreated }: { onCreated: () => void }) {
  const [url, setUrl] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  return (
    <>
      <p className="text-muted">
        Add a news site&apos;s RSS or Atom feed to follow coverage of your
        brands.
      </p>
      <div className="input-group input-group-sm">
        <label className="visually-hidden" htmlFor="new-feed">
          Feed address
        </label>
        <input
          id="new-feed"
          className="form-control"
          placeholder="https://www.lusakatimes.com/feed/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!url.trim()}
          onClick={async () => {
            setProblem(null);
            const r = await postJson("/api/sources/news", {
              feeds: [{ url: url.trim() }],
            });
            if (!r.ok) return setProblem(r.error.message);
            setUrl("");
            onCreated();
          }}
        >
          Add feed
        </button>
      </div>
      {problem && (
        <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
          {problem}
        </div>
      )}
    </>
  );
}

const Gated = withFeature("adminConsole", SourcesPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
