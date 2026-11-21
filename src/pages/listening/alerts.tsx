import { useCallback, useEffect, useState, type ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import { AlertDrawer } from "@/components/alerts/AlertDrawer";
import { ListeningTabs } from "@/components/listening/ListeningTabs";
import { MentionDrawer } from "@/components/listening/MentionDrawer";
import {
  DataTable,
  ErrorState,
  SeverityBadge,
  type Column,
} from "@/components/ui";
import { getJson } from "@/lib/api-client";
import {
  alertSubject,
  STATUS_LABEL,
  type AlertStatus,
  type AlertSummary,
} from "@/lib/alerts";
import { compact } from "@/lib/mentions";
import { formatDateTime } from "@/lib/periods";

const FILTERS: { value: AlertStatus | "ALL"; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ALL", label: "All" },
];

/** Alerts (L-06): the crisis detector's alerts, by status; click one for the drawer. */
function AlertsPage() {
  const router = useRouter();
  const statusParam =
    typeof router.query.status === "string"
      ? router.query.status.toUpperCase()
      : "OPEN";
  const status = (
    FILTERS.some((f) => f.value === statusParam) ? statusParam : "OPEN"
  ) as AlertStatus | "ALL";
  const page = Math.max(
    1,
    Number.parseInt(
      typeof router.query.page === "string" ? router.query.page : "1",
      10,
    ) || 1,
  );
  const url = router.isReady
    ? `/api/alerts?${new URLSearchParams({ ...(status === "ALL" ? {} : { status }), page: String(page) })}`
    : null;
  const [result, setResult] = useState<{
    url: string;
    data?: { total: number; alerts: AlertSummary[] };
    error?: string;
  } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!url) return;
    let current = true;
    void getJson<{ total: number; alerts: AlertSummary[] }>(url).then(
      (r) =>
        current &&
        setResult(
          r.ok ? { url, data: r.data } : { url, error: r.error.message },
        ),
    );
    return () => {
      current = false;
    };
  }, [url, version]);

  const setQuery = useCallback(
    (next: Record<string, string | null>) => {
      const query: Record<string, string | string[] | undefined> = {
        ...router.query,
      };
      for (const [k, v] of Object.entries(next)) {
        if (v === null) delete query[k];
        else query[k] = v;
      }
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );
  const alertId =
    typeof router.query.alert === "string" &&
    /^[0-9a-f-]{36}$/i.test(router.query.alert)
      ? router.query.alert
      : null;
  const mentionId =
    typeof router.query.mention === "string" &&
    /^[0-9a-f-]{36}$/i.test(router.query.mention)
      ? router.query.mention
      : null;

  const r = result && result.url === url ? result : null;
  const total = r?.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 25));
  const columns: Column<AlertSummary>[] = [
    {
      key: "severity",
      header: "Severity",
      render: (a) => <SeverityBadge severity={a.severity} />,
    },
    {
      key: "subject",
      header: "Alert",
      render: (a) => (
        <button
          type="button"
          className="btn btn-link p-0 text-start text-body text-decoration-none text-wrap"
          onClick={() => setQuery({ alert: a.id })}
        >
          <strong>{a.brand.name}</strong>
          <span className="d-block small">{alertSubject(a)}</span>
        </button>
      ),
    },
    {
      key: "neg",
      header: "Negative in 1 h",
      render: (a) => a.negVolume.toLocaleString("en"),
      align: "end",
      sortValue: (a) => a.negVolume,
    },
    {
      key: "reach",
      header: "Reach",
      render: (a) => compact(a.reachNeg),
      align: "end",
      sortValue: (a) => a.reachNeg,
    },
    {
      key: "opened",
      header: "Opened",
      render: (a) => formatDateTime(a.openedAt),
      sortValue: (a) => a.openedAt,
    },
    { key: "status", header: "Status", render: (a) => STATUS_LABEL[a.status] },
    {
      key: "assignee",
      header: "Assignee",
      render: (a) => a.assignee?.name ?? "No one",
    },
  ];

  return (
    <>
      <Head>
        <title>Alerts | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Listening" subTitle="Alerts" />
      <ListeningTabs />
      <div
        className="btn-group btn-group-sm mb-3 flex-wrap"
        role="group"
        aria-label="Status"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`btn ${status === f.value ? "btn-primary" : "btn-outline-primary"}`}
            aria-pressed={status === f.value}
            onClick={() =>
              setQuery({
                status: f.value === "OPEN" ? null : f.value.toLowerCase(),
                page: null,
              })
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-body">
          {r?.error ? (
            <ErrorState
              message={r.error}
              onRetry={() => setVersion((v) => v + 1)}
            />
          ) : (
            <DataTable
              caption={`${STATUS_LABEL[status as AlertStatus] ?? "All"} alerts, newest first`}
              columns={columns}
              rows={r?.data?.alerts ?? []}
              loading={!r}
              rowKey={(a) => a.id}
              empty={{
                title: status === "OPEN" ? "No open alerts" : "No alerts here",
                message:
                  status === "OPEN"
                    ? "The crisis check runs every minute and raises an alert when negative mentions jump."
                    : "Try another status.",
              }}
            />
          )}
          {total > 25 && (
            <nav
              className="d-flex justify-content-between align-items-center mt-3"
              aria-label="Pages"
            >
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() =>
                  setQuery({ page: page - 1 > 1 ? String(page - 1) : null })
                }
              >
                Newer
              </button>
              <span className="small text-muted">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= pages}
                onClick={() => setQuery({ page: String(page + 1) })}
              >
                Older
              </button>
            </nav>
          )}
        </div>
      </div>
      <AlertDrawer
        id={mentionId ? null : alertId}
        onClose={() => setQuery({ alert: null })}
        onChanged={() => setVersion((v) => v + 1)}
        onOpenMention={(id) => setQuery({ mention: id })}
      />
      <MentionDrawer
        id={mentionId}
        onClose={() => setQuery({ mention: null })}
      />
    </>
  );
}

const Gated = withFeature("listening", AlertsPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
