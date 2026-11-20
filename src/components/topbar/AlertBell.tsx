import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Dropdown } from "react-bootstrap";
import { getJson } from "@/lib/api-client";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { formatDateTime } from "@/lib/periods";

interface OpenAlert {
  id: string;
  severity: "WATCH" | "WARNING" | "CRISIS";
  topic: string | null;
  aspect: string | null;
  region: string | null;
  openedAt: string;
  brandName: string;
}

const SEVERITY_CLASS: Record<OpenAlert["severity"], string> = {
  WATCH: "bg-info",
  WARNING: "bg-warning",
  CRISIS: "bg-danger",
};
const REFRESH_MS = 60_000;

/** Bell with the number of open alerts (F-11). Refreshes every minute and when the tab regains focus. */
export default function AlertBell() {
  const [data, setData] = useState<{
    count: number;
    alerts: OpenAlert[];
  } | null>(null);

  const load = useCallback(async () => {
    const result = await getJson<{ count: number; alerts: OpenAlert[] }>(
      "/api/alerts/open",
    );
    if (result.ok) setData(result.data);
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const count = data?.count ?? 0;
  const label =
    count === 0
      ? "No open alerts"
      : `${count} open alert${count === 1 ? "" : "s"}`;
  const alertsPage = isFeatureEnabled("listening") ? "/listening#alerts" : null;

  return (
    <Dropdown as="li" className="pc-h-item">
      <Dropdown.Toggle
        as="button"
        type="button"
        className="pc-head-link arrow-none me-0"
        aria-label={label}
      >
        <i className="ph-duotone ph-bell" aria-hidden="true"></i>
        {count > 0 && (
          <span className="badge bg-danger pc-h-badge">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-notification dropdown-menu-end pc-h-dropdown">
        <div className="dropdown-header d-flex align-items-center justify-content-between">
          <h4 className="m-0">Alerts</h4>
          <span className="text-muted small">{label}</span>
        </div>
        {count === 0 ? (
          <p className="px-3 py-2 mb-0 text-muted">
            Nothing needs attention right now.
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {data!.alerts.map((alert) => (
              <li key={alert.id} className="list-group-item">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className={`badge ${SEVERITY_CLASS[alert.severity]}`}>
                    {alert.severity.toLowerCase()}
                  </span>
                  <span className="fw-semibold">{alert.brandName}</span>
                </div>
                <p className="mb-1">
                  {[alert.topic, alert.aspect, alert.region]
                    .filter(Boolean)
                    .join(" · ") || "Negative spike"}
                </p>
                <small className="text-muted">
                  {formatDateTime(alert.openedAt)}
                </small>
              </li>
            ))}
          </ul>
        )}
        {alertsPage && count > 0 && (
          <div className="dropdown-footer px-3 py-2 text-center">
            <Link href={alertsPage}>View all alerts</Link>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
