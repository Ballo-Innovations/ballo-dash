import { useState, type ReactElement } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "@layout/index";
import {
  BillingBadge,
  DataTable,
  Drawer,
  EmptyState,
  ErrorState,
  KpiCard,
  SentimentPill,
  SeriesChart,
  SeverityBadge,
  SkeletonCard,
  SourceChip,
  type BillingStatus,
  type Column,
  type ForecastPoint,
  type SeriesPoint,
  type Sentiment,
  type Severity,
  type SourceKind,
} from "@/components/ui";
import { formatMoney } from "@/lib/money";

/**
 * Component gallery (F-12): every shared component in every state, for design review and QA.
 * Only served in development or when NEXT_PUBLIC_SHOW_DEV_PAGES=true.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_DEV_PAGES === "true";
  return allowed ? { props: {} } : { notFound: true };
};

const SENTIMENTS: Sentiment[] = ["NEG", "NEU", "POS"];
const SEVERITIES: Severity[] = ["WATCH", "WARNING", "CRISIS"];
const BILLING: BillingStatus[] = [
  "PLANNED",
  "BOOKED",
  "INVOICED",
  "PAID",
  "DISPUTED",
];
const SOURCES: SourceKind[] = ["LIVE", "IMPORT", "SIMULATED", "STUB"];

const day = (offset: number) =>
  new Date(Date.UTC(2026, 10, 1 + offset)).toISOString();
const actual: SeriesPoint[] = Array.from({ length: 20 }, (_, i) => ({
  x: day(i),
  y: Math.round(1200 + i * 35 + 120 * Math.sin(i / 2)),
}));
const competitor: SeriesPoint[] = Array.from({ length: 20 }, (_, i) => ({
  x: day(i),
  y: Math.round(900 + i * 20 + 80 * Math.cos(i / 3)),
}));
const forecast: ForecastPoint[] = Array.from({ length: 10 }, (_, i) => {
  const y = 1900 + i * 30;
  return { x: day(19 + i), y, low: y - 60 - i * 15, high: y + 60 + i * 15 };
});

interface Line {
  id: string;
  channel: string;
  vendor: string;
  budget: number;
  status: BillingStatus;
}
const lines: Line[] = [
  {
    id: "1",
    channel: "Facebook",
    vendor: "Meta",
    budget: 1_250_000,
    status: "PAID",
  },
  {
    id: "2",
    channel: "Radio",
    vendor: "Hot FM",
    budget: 800_000,
    status: "INVOICED",
  },
  {
    id: "3",
    channel: "Outdoor",
    vendor: "Alliance Media",
    budget: 2_400_000,
    status: "DISPUTED",
  },
  {
    id: "4",
    channel: "X",
    vendor: "X Corp",
    budget: 300_000,
    status: "BOOKED",
  },
];
const columns: Column<Line>[] = [
  {
    key: "channel",
    header: "Channel",
    render: (r) => r.channel,
    sortValue: (r) => r.channel,
  },
  { key: "vendor", header: "Vendor", render: (r) => r.vendor },
  {
    key: "budget",
    header: "Budget",
    render: (r) => formatMoney(r.budget),
    sortValue: (r) => r.budget,
    align: "end",
  },
  {
    key: "status",
    header: "Billing",
    render: (r) => <BillingBadge status={r.status} />,
    sortValue: (r) => r.status,
  },
];

// A div, not <section>: landing styles give every <section> 100px of vertical padding.
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = `gallery-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="card mb-4" role="region" aria-labelledby={id}>
      <div className="card-header">
        <h5 className="mb-0" id={id}>
          {title}
        </h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default function ComponentsGallery() {
  const [drawer, setDrawer] = useState<Line | null>(null);
  const [tableState, setTableState] = useState<"rows" | "loading" | "empty">(
    "rows",
  );

  return (
    <>
      <Head>
        <title>Components | Ballo Dash</title>
      </Head>
      <h2 className="mb-4">Shared components</h2>

      <Section title="Pills and chips">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {SENTIMENTS.map((s) => (
            <SentimentPill key={s} sentiment={s} />
          ))}
          <SentimentPill sentiment="NEG" score={-0.62} />
          <SentimentPill sentiment="POS" score={0.48} />
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {SEVERITIES.map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {BILLING.map((s) => (
            <BillingBadge key={s} status={s} />
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <SourceChip key={s} kind={s} />
          ))}
        </div>
      </Section>

      <Section title="KPI cards">
        <div className="row g-3">
          <div className="col-12 col-md-6 col-xl-3">
            <KpiCard
              label="Mentions"
              value="12,480"
              delta={0.124}
              source="LIVE"
              definition="Posts and articles that mention the brand in the period."
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <KpiCard
              label="Negative share"
              value="18%"
              delta={0.031}
              lowerIsBetter
              source="SIMULATED"
              definition="Negative mentions divided by all mentions."
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <KpiCard
              label="Paid spend"
              value={formatMoney(4_750_000)}
              delta={null}
              source="IMPORT"
              definition="Actual spend across media plan lines."
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <KpiCard
              label="Sessions"
              value={null}
              source="STUB"
              definition="Website visits from the first-party tracker."
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <KpiCard
              label="Loading"
              value={null}
              loading
              definition="Shown while data loads."
            />
          </div>
        </div>
      </Section>

      <Section title="Series chart">
        <SeriesChart
          ariaLabel="Mentions per day for Infratel and a competitor, with a 10 day forecast"
          series={[
            { name: "Infratel", points: actual },
            { name: "Competitor", points: competitor },
          ]}
          forecast={{ name: "Forecast", points: forecast }}
        />
        <h6 className="mt-4">No data</h6>
        <SeriesChart
          ariaLabel="Empty chart"
          series={[{ name: "Mentions", points: [] }]}
        />
      </Section>

      <Section title="Data table">
        <div
          className="btn-group btn-group-sm mb-3"
          role="group"
          aria-label="Table state"
        >
          {(["rows", "loading", "empty"] as const).map((state) => (
            <button
              key={state}
              type="button"
              className={`btn ${tableState === state ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTableState(state)}
            >
              {state === "rows"
                ? "With rows"
                : state === "loading"
                  ? "Loading"
                  : "Empty"}
            </button>
          ))}
        </div>
        <DataTable
          caption="Media plan lines"
          columns={columns}
          rows={tableState === "empty" ? [] : lines}
          loading={tableState === "loading"}
          rowKey={(r) => r.id}
          initialSort={{ key: "budget", direction: "desc" }}
          onRowClick={setDrawer}
          empty={{
            title: "No media plan lines",
            message: "Add a line to start tracking spend.",
            action: (
              <button className="btn btn-primary btn-sm">Add line</button>
            ),
          }}
        />
      </Section>

      <Section title="Loading, empty and error states">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <SkeletonCard />
          </div>
          <div className="col-12 col-md-4">
            <div className="card">
              <EmptyState
                icon="ph-duotone ph-ear"
                title="No mentions yet"
                message="Connect a source to start listening."
                action={
                  <button className="btn btn-primary btn-sm">
                    Connect a source
                  </button>
                }
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card">
              <ErrorState
                message="The server did not respond. Check your connection."
                onRetry={() => undefined}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Crisis border">
        <div className="card ui-crisis-pulse">
          <div className="card-body d-flex align-items-center gap-2">
            <SeverityBadge severity="CRISIS" /> Network outage complaints in
            Lusaka are rising fast.
          </div>
        </div>
      </Section>

      <Drawer
        show={drawer !== null}
        onClose={() => setDrawer(null)}
        title={drawer ? `${drawer.channel} with ${drawer.vendor}` : ""}
        footer={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDrawer(null)}
          >
            Close
          </button>
        }
      >
        {drawer && (
          <dl className="mb-0">
            <dt>Budget</dt>
            <dd className="ui-kpi-value">{formatMoney(drawer.budget)}</dd>
            <dt>Billing</dt>
            <dd>
              <BillingBadge status={drawer.status} />
            </dd>
          </dl>
        )}
      </Drawer>
    </>
  );
}

ComponentsGallery.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
