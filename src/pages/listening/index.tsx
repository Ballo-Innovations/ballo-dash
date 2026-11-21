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
import { FilterBar } from "@/components/listening/FilterBar";
import { ListeningTabs } from "@/components/listening/ListeningTabs";
import { RisingTopics } from "@/components/listening/RisingTopics";
import { MentionCard } from "@/components/listening/MentionCard";
import { MentionDrawer } from "@/components/listening/MentionDrawer";
import { EmptyState, ErrorState, SkeletonCard } from "@/components/ui";
import { useFilters } from "@/hooks/useFilters";
import { getJson } from "@/lib/api-client";
import {
  LISTENING_KEYS,
  PAGE_SIZE,
  listeningQuery,
  mentionsUrl,
  parseListeningFilters,
  type ListeningFilters,
  type MentionOptions,
  type MentionsPage,
} from "@/lib/mentions";

/** Listening (L-01): every mention in the period, filtered and paged on the server. */
function ListeningPage() {
  const router = useRouter();
  const { filters: shared, range } = useFilters();
  const filters = useMemo(
    () => parseListeningFilters(router.query),
    [router.query],
  );
  const url = router.isReady ? mentionsUrl(range, shared.brand, filters) : null;
  const [result, setResult] = useState<{
    url: string;
    data?: MentionsPage;
    error?: string;
  } | null>(null);
  const [options, setOptions] = useState<MentionOptions | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void getJson<MentionOptions>("/api/mentions/options").then(
      (r) => r.ok && setOptions(r.data),
    );
  }, []);

  useEffect(() => {
    if (!url) return;
    let current = true;
    void getJson<MentionsPage>(url).then((r) => {
      if (!current) return;
      setResult(r.ok ? { url, data: r.data } : { url, error: r.error.message });
    });
    return () => {
      current = false;
    };
  }, [url, attempt]);

  // Keep showing the last page while the next one loads.
  const [shown, setShown] = useState<MentionsPage | null>(null);
  if (result?.data && result.data !== shown) setShown(result.data);
  const data = shown;
  const loading = !result || result.url !== url;
  const error = !loading ? (result?.error ?? null) : null;

  const setFilters = useCallback(
    (next: Partial<ListeningFilters>) => {
      const merged: ListeningFilters = {
        ...filters,
        ...next,
        page: next.page ?? 1,
      };
      const rest = Object.fromEntries(
        Object.entries(router.query).filter(
          ([k]) => !(LISTENING_KEYS as readonly string[]).includes(k),
        ),
      );
      void router.replace(
        {
          pathname: router.pathname,
          query: { ...rest, ...listeningQuery(merged) },
        },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [filters, router],
  );

  // The open mention is in the URL (?mention=<id>), so a drawer can be linked to.
  const mentionParam = router.query.mention;
  const openId =
    typeof mentionParam === "string" && /^[0-9a-f-]{36}$/i.test(mentionParam)
      ? mentionParam
      : null;
  const setOpen = useCallback(
    (id: string | null) => {
      const { mention: _drop, ...rest } = router.query;
      void router.replace(
        {
          pathname: router.pathname,
          query: id ? { ...rest, mention: id } : rest,
        },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router],
  );

  const total = data?.total ?? 0;
  const firstShown = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(filters.page * PAGE_SIZE, total);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered =
    filters.sentiment.length +
      filters.channel.length +
      filters.topic.length +
      filters.region.length >
      0 || !!filters.q;

  return (
    <>
      <Head>
        <title>Listening | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Listening" subTitle="Mentions" />
      <ListeningTabs />
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <FilterBar
            filters={filters}
            options={options}
            counts={data?.counts ?? null}
            onChange={setFilters}
          />

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
            <p className="mb-0 text-muted" aria-live="polite">
              {loading && !data
                ? "Loading mentions"
                : `${total.toLocaleString("en")} mention${total === 1 ? "" : "s"}`}
              {total > 0 &&
                ` · showing ${firstShown.toLocaleString("en")} to ${lastShown.toLocaleString("en")}`}
            </p>
          </div>

          {error ? (
            <div className="card">
              <ErrorState
                message={error}
                onRetry={() => {
                  setResult(null);
                  setAttempt((a) => a + 1);
                }}
              />
            </div>
          ) : loading && !data ? (
            <div className="d-grid gap-2">
              <SkeletonCard lines={2} label="Loading mentions" />
              <SkeletonCard lines={2} label="Loading mentions" />
              <SkeletonCard lines={2} label="Loading mentions" />
            </div>
          ) : total === 0 ? (
            <div className="card">
              <EmptyState
                icon="ph-duotone ph-ear"
                title={
                  filtered
                    ? "No mentions match these filters"
                    : "No mentions in this period"
                }
                message={
                  filtered
                    ? "Try fewer filters or a longer period."
                    : "Mentions appear here as sources bring them in."
                }
                action={
                  filtered ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        setFilters({
                          sentiment: [],
                          channel: [],
                          topic: [],
                          region: [],
                          q: "",
                        })
                      }
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div style={{ opacity: loading ? 0.6 : 1 }} aria-busy={loading}>
              {data?.mentions.map((m) => (
                <MentionCard
                  key={m.id}
                  mention={m}
                  onOpen={(x) => setOpen(x.id)}
                />
              ))}
            </div>
          )}

          {total > PAGE_SIZE && !error && (
            <nav
              className="d-flex justify-content-between align-items-center my-3"
              aria-label="Pages"
            >
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={filters.page <= 1 || loading}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                <i
                  className="ph-duotone ph-caret-left me-1"
                  aria-hidden="true"
                />
                Newer
              </button>
              <span className="small text-muted">
                Page {filters.page.toLocaleString("en")} of{" "}
                {pages.toLocaleString("en")}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={filters.page >= pages || loading}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Older
                <i
                  className="ph-duotone ph-caret-right ms-1"
                  aria-hidden="true"
                />
              </button>
            </nav>
          )}
        </div>
        <div className="col-12 col-xl-4">
          <div className="listening-side">
            <RisingTopics />
          </div>
        </div>
      </div>
      <MentionDrawer id={openId} onClose={() => setOpen(null)} />
    </>
  );
}

const Gated = withFeature("listening", ListeningPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
