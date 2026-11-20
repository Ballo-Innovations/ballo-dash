import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import { EmptyState, Skeleton } from "./States";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton height={280} />,
});

export interface SeriesPoint {
  /** ISO date or timestamp. */
  x: string;
  y: number;
}

export interface ForecastPoint extends SeriesPoint {
  low: number;
  high: number;
}

export interface SeriesChartProps {
  series: { name: string; points: SeriesPoint[]; color?: string }[];
  /** Drawn as a dashed line with a shaded band between low and high. */
  forecast?: { name: string; points: ForecastPoint[] };
  height?: number;
  /** Formats axis and tooltip values (formatMoney, percentages...). */
  formatValue?: (value: number) => string;
  ariaLabel: string;
}

function themeIsDark(): boolean {
  return (
    typeof document !== "undefined" &&
    document.body.getAttribute("data-pc-theme") === "dark"
  );
}

/** Time series built on ApexCharts with an optional forecast band (F-12). */
export function SeriesChart({
  series,
  forecast,
  height = 300,
  formatValue = (v) => v.toLocaleString("en-GB"),
  ariaLabel,
}: SeriesChartProps) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(themeIsDark());
    const observer = new MutationObserver(() => setDark(themeIsDark()));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-pc-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const hasData =
    series.some((s) => s.points.length > 0) ||
    (forecast?.points.length ?? 0) > 0;
  if (!hasData)
    return (
      <EmptyState
        icon="ph-duotone ph-chart-line"
        title="No data for this period"
        message="Try a longer period or another brand."
      />
    );

  const apexSeries: ApexAxisChartSeries = [
    ...series.map((s) => ({
      name: s.name,
      type: "line",
      data: s.points.map((p) => ({ x: new Date(p.x).getTime(), y: p.y })),
    })),
  ];
  const colors = series.map(
    (s, i) => s.color ?? ["#0ea5e9", "#a855f7", "#f59e0b", "#14b8a6"][i % 4],
  );
  const dashes = series.map(() => 0);
  const widths = series.map(() => 2);
  if (forecast && forecast.points.length > 0) {
    apexSeries.push({
      name: `${forecast.name} range`,
      type: "rangeArea",
      data: forecast.points.map((p) => ({
        x: new Date(p.x).getTime(),
        y: [p.low, p.high],
      })),
    } as never);
    apexSeries.push({
      name: forecast.name,
      type: "line",
      data: forecast.points.map((p) => ({
        x: new Date(p.x).getTime(),
        y: p.y,
      })),
    });
    colors.push("#94a3b8", "#64748b");
    dashes.push(0, 6);
    widths.push(0, 2);
  }

  const options: ApexOptions = {
    chart: {
      type: "rangeArea",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: "inherit",
      background: "transparent",
    },
    theme: { mode: dark ? "dark" : "light" },
    colors,
    stroke: { curve: "straight", width: widths, dashArray: dashes },
    fill: {
      opacity: apexSeries.map((s) =>
        (s as { type?: string }).type === "rangeArea" ? 0.18 : 1,
      ),
    },
    dataLabels: { enabled: false },
    legend: {
      show: apexSeries.length > 1,
      position: "top",
      horizontalAlign: "left",
    },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: { labels: { formatter: (value: number) => formatValue(value) } },
    tooltip: { shared: true, x: { format: "dd MMM yyyy" } },
    grid: { borderColor: dark ? "#22304a" : "#e5e7eb" },
  };

  return (
    <div role="img" aria-label={ariaLabel}>
      <Chart
        type="rangeArea"
        series={apexSeries}
        options={options}
        height={height}
      />
    </div>
  );
}
