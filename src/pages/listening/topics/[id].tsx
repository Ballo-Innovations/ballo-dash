import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import { MentionCard } from "@/components/listening/MentionCard";
import { MentionDrawer } from "@/components/listening/MentionDrawer";
import {
  EmptyState,
  ErrorState,
  SeriesChart,
  SkeletonCard,
} from "@/components/ui";
import { getJson } from "@/lib/api-client";
import {
  PAGE_SIZE,
  mentionsUrl,
  parseListeningFilters,
  type MentionsPage,
} from "@/lib/mentions";
import { versusUsual, type Topic } from "@/lib/topics";

const WINDOW_MS = 24 * 3600 * 1000;

/** A topic (L-04): how it rose over 15 days, its terms, and its mentions. */
function TopicPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const page = parseListeningFilters(router.query).page;
  const [topic, setTopic] = useState<{
    id: string;
    data?: Topic;
    error?: string;
  } | null>(null);
  const [list, setList] = useState<{
    url: string;
    data?: MentionsPage;
    error?: string;
  } | null>(null);
  // The detector looks at the last 15 windows of 24 hours; list the same span.
  const [now] = useState(() => Date.now());
  const range = useMemo(
    () => ({
      start: new Date(now - 15 * WINDOW_MS),
      end: new Date(now + 60_000),
    }),
    [now],
  );

  useEffect(() => {
    if (!id) return;
    let current = true;
    void getJson<Topic>(`/api/topics/${encodeURIComponent(id)}`).then(
      (r) =>
        current &&
        setTopic(r.ok ? { id, data: r.data } : { id, error: r.error.message }),
    );
    return () => {
      current = false;
    };
  }, [id]);
  const t = topic && topic.id === id ? topic.data : undefined;
  const url = t
    ? mentionsUrl(range, undefined, {
        sentiment: [],
        channel: [],
        topic: [t.name],
        region: [],
        q: "",
        page,
      })
    : null;
  useEffect(() => {
    if (!url) return;
    let current = true;
    void getJson<MentionsPage>(url).then(
      (r) =>
        current &&
        setList(r.ok ? { url, data: r.data } : { url, error: r.error.message }),
    );
    return () => {
      current = false;
    };
  }, [url]);

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
  const mentionParam = router.query.mention;
  const openId =
    typeof mentionParam === "string" && /^[0-9a-f-]{36}$/i.test(mentionParam)
      ? mentionParam
      : null;
  const l = list && list.url === url ? list : null;
  const total = l?.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const chart = t
    ? t.dailyCounts.map((y, i) => ({
        x: new Date(
          now - (t.dailyCounts.length - 1 - i) * WINDOW_MS,
        ).toISOString(),
        y,
      }))
    : [];

  if (topic?.error)
    return (
      <>
        <BreadcrumbItem mainTitle="Listening" subTitle="Topic" />
        <div className="card">
          <ErrorState
            title="This topic could not be loaded"
            message={topic.error}
          />
        </div>
      </>
    );

  return (
    <>
      <Head>
        <title>
          {t ? `${t.name} | Listening` : "Topic | Listening"} | Ballo Dash
        </title>
      </Head>
      <BreadcrumbItem mainTitle="Listening" subTitle={t?.name ?? "Topic"} />
      <Link
        href={{
          pathname: "/listening",
          query: router.query.features
            ? { features: router.query.features }
            : {},
        }}
        className="d-inline-block mb-3 small"
      >
        <i className="ph-duotone ph-arrow-left me-1" aria-hidden="true" />
        All mentions
      </Link>
      {!t ? (
        <SkeletonCard lines={4} label="Loading topic" />
      ) : (
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3 align-items-baseline mb-2">
              <span>
                <strong className="f-20">
                  {t.mentionCount.toLocaleString("en")}
                </strong>{" "}
                mentions in the last 24 hours
              </span>
              {versusUsual(t.dailyCounts) && (
                <span className="text-muted">{versusUsual(t.dailyCounts)}</span>
              )}
              <span
                className="text-muted"
                title="Standard deviations above the 14 day average"
              >
                {t.score > 0 ? `z ${t.score.toFixed(1)}` : "No longer rising"}
              </span>
            </div>
            <div
              className="d-flex flex-wrap gap-2 mb-3"
              aria-label="Terms in this topic"
            >
              {t.terms.map((term) => (
                <span key={term} className="ui-pill ui-sentiment-neu">
                  {term}
                </span>
              ))}
            </div>
            <SeriesChart
              ariaLabel={`${t.name}: mentions per day over 15 days`}
              height={220}
              series={[{ name: "Mentions", points: chart }]}
            />
          </div>
        </div>
      )}

      {t &&
        (l?.error ? (
          <div className="card">
            <ErrorState message={l.error} />
          </div>
        ) : !l ? (
          <SkeletonCard lines={2} label="Loading mentions" />
        ) : total === 0 ? (
          <div className="card">
            <EmptyState
              icon="ph-duotone ph-chat-circle"
              title="No mentions tagged with this topic yet"
              message="Mentions are tagged when the trend check runs, every 15 minutes."
            />
          </div>
        ) : (
          <>
            <p className="text-muted mb-2">
              {total.toLocaleString("en")} mention{total === 1 ? "" : "s"} in
              the last 15 days
            </p>
            {l.data?.mentions.map((m) => (
              <MentionCard
                key={m.id}
                mention={m}
                onOpen={(x) => setQuery({ mention: x.id })}
              />
            ))}
            {total > PAGE_SIZE && (
              <nav
                className="d-flex justify-content-between align-items-center my-3"
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
          </>
        ))}
      <MentionDrawer id={openId} onClose={() => setQuery({ mention: null })} />
    </>
  );
}

const Gated = withFeature("listening", TopicPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
