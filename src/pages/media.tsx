import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import { MentionDrawer } from "@/components/listening/MentionDrawer";
import {
  DataTable,
  EmptyState,
  ErrorState,
  KpiCard,
  SentimentPill,
  SeriesChart,
  type Column,
} from "@/components/ui";
import { useFilters } from "@/hooks/useFilters";
import { getJson } from "@/lib/api-client";
import {
  compact,
  mentionsUrl,
  parseListeningFilters,
  type Mention,
  type MentionsPage,
} from "@/lib/mentions";
import { formatDate } from "@/lib/periods";

interface Outlet {
  outlet: string;
  articles: number;
  reach: number;
  neg: number;
  neu: number;
  pos: number;
}
interface MediaSummary {
  totals: {
    articles: number;
    reach: number;
    outlets: number;
    negativeShare: number | null;
  };
  outlets: Outlet[];
  coverage: { date: string; articles: number; reach: number }[];
}

/** Every day in the range, so days without coverage show as 0 on the chart. */
function fillDays(
  points: { date: string; articles: number }[],
  start: Date,
  end: Date,
) {
  const byDate = new Map(points.map((p) => [p.date, p.articles]));
  const out: { x: string; y: number }[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += 86_400_000) {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lusaka",
    }).format(new Date(t + 12 * 3600_000));
    if (out.length && out[out.length - 1].x.startsWith(date)) continue;
    out.push({ x: `${date}T12:00:00Z`, y: byDate.get(date) ?? 0 });
  }
  return out;
}

function SentimentSplit({ o }: { o: Outlet }) {
  const total = o.neg + o.neu + o.pos || 1;
  return (
    <div
      className="media-split"
      role="img"
      aria-label={`${o.neg} negative, ${o.neu} neutral, ${o.pos} positive`}
    >
      <span
        className="media-split-neg"
        style={{ width: `${(o.neg / total) * 100}%` }}
      />
      <span
        className="media-split-neu"
        style={{ width: `${(o.neu / total) * 100}%` }}
      />
      <span
        className="media-split-pos"
        style={{ width: `${(o.pos / total) * 100}%` }}
      />
    </div>
  );
}

const outletColumns: Column<Outlet>[] = [
  {
    key: "outlet",
    header: "Outlet",
    render: (o) => o.outlet,
    sortValue: (o) => o.outlet,
  },
  {
    key: "articles",
    header: "Articles",
    render: (o) => o.articles.toLocaleString("en"),
    sortValue: (o) => o.articles,
    align: "end",
  },
  {
    key: "reach",
    header: "Est. reach",
    render: (o) => compact(o.reach),
    sortValue: (o) => o.reach,
    align: "end",
  },
  {
    key: "sentiment",
    header: "Sentiment",
    render: (o) => <SentimentSplit o={o} />,
  },
];

/** Media (L-05): news coverage, outlets ranked by estimated reach, and the articles. */
function MediaPage() {
  const router = useRouter();
  const { filters, range } = useFilters();
  const page = parseListeningFilters(router.query).page;
  const summaryUrl = router.isReady
    ? `/api/media/summary?${new URLSearchParams({ from: range.start.toISOString(), to: range.end.toISOString(), ...(filters.brand ? { brand: filters.brand } : {}) })}`
    : null;
  const articlesUrl = router.isReady
    ? mentionsUrl(range, filters.brand, {
        sentiment: [],
        channel: ["NEWS"],
        topic: [],
        region: [],
        q: "",
        page,
      })
    : null;
  const [summary, setSummary] = useState<{
    url: string;
    data?: MediaSummary;
    error?: string;
  } | null>(null);
  const [articles, setArticles] = useState<{
    url: string;
    data?: MentionsPage;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!summaryUrl) return;
    let current = true;
    void getJson<MediaSummary>(summaryUrl).then(
      (r) =>
        current &&
        setSummary(
          r.ok
            ? { url: summaryUrl, data: r.data }
            : { url: summaryUrl, error: r.error.message },
        ),
    );
    return () => {
      current = false;
    };
  }, [summaryUrl, attempt]);
  useEffect(() => {
    if (!articlesUrl) return;
    let current = true;
    void getJson<MentionsPage>(articlesUrl).then(
      (r) =>
        current &&
        setArticles(
          r.ok
            ? { url: articlesUrl, data: r.data }
            : { url: articlesUrl, error: r.error.message },
        ),
    );
    return () => {
      current = false;
    };
  }, [articlesUrl, attempt]);

  const mentionParam = router.query.mention;
  const openId =
    typeof mentionParam === "string" && /^[0-9a-f-]{36}$/i.test(mentionParam)
      ? mentionParam
      : null;
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

  const s = summary && summary.url === summaryUrl ? summary : null;
  const a = articles && articles.url === articlesUrl ? articles : null;
  const error = s?.error ?? a?.error ?? null;
  const chart = useMemo(
    () => (s?.data ? fillDays(s.data.coverage, range.start, range.end) : []),
    [s, range],
  );
  const articleColumns: Column<Mention>[] = [
    { key: "date", header: "Date", render: (m) => formatDate(m.occurredAt) },
    {
      key: "outlet",
      header: "Outlet",
      render: (m) => m.outlet ?? m.author ?? "Unknown",
    },
    {
      key: "headline",
      header: "Headline",
      render: (m) => (
        <button
          type="button"
          className="btn btn-link p-0 text-start text-body text-decoration-none text-wrap"
          onClick={() => setQuery({ mention: m.id })}
        >
          {m.headline ?? m.text.slice(0, 120)}
        </button>
      ),
    },
    {
      key: "sentiment",
      header: "Sentiment",
      render: (m) => <SentimentPill sentiment={m.sentiment} />,
    },
    {
      key: "reach",
      header: "Est. reach",
      render: (m) => compact(m.reach),
      align: "end",
    },
    {
      key: "brand",
      header: "Brand",
      render: (m) => `${m.brand.name}${m.brand.isSelf ? "" : " (competitor)"}`,
    },
  ];
  const total = a?.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <>
      <Head>
        <title>Media | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Listening" subTitle="Media" />
      {error ? (
        <div className="card">
          <ErrorState
            message={error}
            onRetry={() => {
              setSummary(null);
              setArticles(null);
              setAttempt((n) => n + 1);
            }}
          />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            {[
              {
                label: "Articles",
                value: s?.data?.totals.articles.toLocaleString("en"),
                definition: "News articles that name a brand in the period.",
              },
              {
                label: "Estimated reach",
                value: s?.data ? compact(s.data.totals.reach) : undefined,
                definition:
                  "Sum of each outlet's estimated readers per article.",
              },
              {
                label: "Outlets",
                value: s?.data?.totals.outlets.toLocaleString("en"),
                definition: "Outlets with at least one article.",
              },
              {
                label: "Negative share",
                value: s?.data
                  ? s.data.totals.negativeShare === null
                    ? "No articles"
                    : `${Math.round(s.data.totals.negativeShare * 100)}%`
                  : undefined,
                definition: "Negative articles divided by all articles.",
              },
            ].map((k) => (
              <div className="col-12 col-sm-6 col-xl-3" key={k.label}>
                <KpiCard
                  label={k.label}
                  value={k.value ?? null}
                  loading={!s}
                  source="LIVE"
                  definition={k.definition}
                />
              </div>
            ))}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-xl-7">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Coverage over time</h5>
                </div>
                <div className="card-body">
                  <SeriesChart
                    ariaLabel="News articles per day"
                    height={260}
                    series={[{ name: "Articles", points: chart }]}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-5">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Outlets by reach</h5>
                </div>
                <div className="card-body">
                  <DataTable
                    caption="Outlets ranked by estimated reach"
                    columns={outletColumns}
                    rows={s?.data?.outlets ?? []}
                    loading={!s}
                    rowKey={(o) => o.outlet}
                    initialSort={{ key: "reach", direction: "desc" }}
                    empty={{
                      title: "No news coverage",
                      message: "Articles from your news feeds appear here.",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0">Articles</h5>
              {total > 0 && (
                <span className="small text-muted">
                  {total.toLocaleString("en")} article{total === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="card-body">
              {a && total === 0 ? (
                <EmptyState
                  icon="ph-duotone ph-newspaper"
                  title="No articles in this period"
                  message="Try a longer period, or add news feeds as sources."
                />
              ) : (
                <DataTable
                  caption="News articles, newest first"
                  columns={articleColumns}
                  rows={a?.data?.mentions ?? []}
                  loading={!a}
                  rowKey={(m) => m.id}
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
        </>
      )}
      <MentionDrawer id={openId} onClose={() => setQuery({ mention: null })} />
    </>
  );
}

const Gated = withFeature("listening", MediaPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
