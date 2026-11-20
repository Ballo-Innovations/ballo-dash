import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { SourceChip, type SourceKind } from "./Pills";
import { Skeleton } from "./States";

export interface KpiCardProps {
  label: string;
  /** Already formatted for display (formatMoney, toLocaleString in a fixed locale, ...). */
  value: string | null;
  /** Change versus the previous period as a fraction (0.12 = +12%); null when there is nothing to compare. */
  delta?: number | null;
  /** Some metrics are better when they fall (complaints, cost per result). */
  lowerIsBetter?: boolean;
  source?: SourceKind;
  /** Every KPI explains how it is calculated (design system micro-rule). */
  definition: string;
  loading?: boolean;
}

export function formatDelta(delta: number): string {
  const percent = Math.round(delta * 1000) / 10;
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

export function KpiCard({
  label,
  value,
  delta,
  lowerIsBetter = false,
  source,
  definition,
  loading = false,
}: KpiCardProps) {
  const good =
    delta === null || delta === undefined || delta === 0
      ? null
      : delta > 0 !== lowerIsBetter;
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-2">
          <h6 className="mb-0 text-muted">{label}</h6>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{definition}</Tooltip>}
          >
            <button
              type="button"
              className="btn btn-link p-0 text-muted lh-1"
              aria-label={`How ${label} is calculated: ${definition}`}
            >
              <i className="ph-duotone ph-info" aria-hidden="true"></i>
            </button>
          </OverlayTrigger>
          {source && (
            <span className="ms-auto">
              <SourceChip kind={source} />
            </span>
          )}
        </div>
        {loading ? (
          <>
            <Skeleton width="55%" height={30} />
            <span className="visually-hidden" role="status">
              Loading {label}
            </span>
          </>
        ) : (
          <div className="d-flex align-items-baseline gap-2 flex-wrap">
            <span className="h3 mb-0 ui-kpi-value">{value ?? "No data"}</span>
            {delta !== undefined && delta !== null && (
              <span
                className={`small fw-semibold ${good === null ? "text-muted" : good ? "ui-delta-up" : "ui-delta-down"}`}
              >
                <i
                  className={`ph ${delta > 0 ? "ph-arrow-up-right" : delta < 0 ? "ph-arrow-down-right" : "ph-minus"}`}
                  aria-hidden="true"
                ></i>{" "}
                {formatDelta(delta)}
                <span className="visually-hidden">
                  {" "}
                  versus the previous period
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
