import { useCallback, useMemo, useState, type ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import { ListeningTabs } from "@/components/listening/ListeningTabs";
import { MentionCard } from "@/components/listening/MentionCard";
import { MentionDrawer } from "@/components/listening/MentionDrawer";
import { EmptyState } from "@/components/ui";
import { useFilters } from "@/hooks/useFilters";
import { useMentionStream } from "@/hooks/useMentionStream";
import { MAX_CARDS, STATUS_LABELS } from "@/lib/live";

/** Live wall (L-02): mentions as they arrive, newest first, the last 200 kept. */
function LiveWall() {
  const router = useRouter();
  const { filters } = useFilters();
  const [paused, setPaused] = useState(false);
  const { mentions, status, waiting } = useMentionStream(paused);
  const shown = useMemo(
    () =>
      filters.brand
        ? mentions.filter((m) => m.brand.id === filters.brand)
        : mentions,
    [mentions, filters.brand],
  );

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

  return (
    <>
      <Head>
        <title>Live wall | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Listening" subTitle="Live wall" />
      <ListeningTabs />
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span
          className={`live-status live-status-${status}`}
          role="status"
          aria-live="polite"
        >
          <span className="live-dot" aria-hidden="true" />
          {STATUS_LABELS[status]}
        </span>
        <span className="text-muted small">
          {shown.length.toLocaleString("en")} on the wall (the latest{" "}
          {MAX_CARDS} are kept)
        </span>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ms-auto"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <>
              <i className="ph-duotone ph-play me-1" aria-hidden="true" />
              Resume{waiting > 0 && ` (${waiting.toLocaleString("en")} new)`}
            </>
          ) : (
            <>
              <i className="ph-duotone ph-pause me-1" aria-hidden="true" />
              Pause
            </>
          )}
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="ph-duotone ph-broadcast"
            title={
              status === "closed"
                ? "The live wall could not connect"
                : "Waiting for mentions"
            }
            message={
              status === "closed"
                ? "Reload the page to try again."
                : "New mentions appear here within a couple of seconds."
            }
          />
        </div>
      ) : (
        <div className="live-wall">
          {shown.map((m) => (
            <MentionCard key={m.id} mention={m} onOpen={(x) => setOpen(x.id)} />
          ))}
        </div>
      )}
      <MentionDrawer id={openId} onClose={() => setOpen(null)} />
    </>
  );
}

const Gated = withFeature("listening", LiveWall);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
