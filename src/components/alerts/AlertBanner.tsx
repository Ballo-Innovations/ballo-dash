import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getJson } from "@/lib/api-client";
import { alertSubject, SEVERITY_LABEL, type OpenAlert } from "@/lib/alerts";
import { isFeatureEnabled } from "@/lib/feature-flags";

const REFRESH_MS = 60_000;

/**
 * Banner while any alert is OPEN (L-06). It has no close button on purpose: it stays until the
 * alert is acknowledged or resolved. Shows the most severe open alert and how many more there are.
 */
export function AlertBanner() {
  // Read once on the client; the banner renders nothing until its data arrives, so the server render matches.
  const [enabled] = useState(
    () => typeof window !== "undefined" && isFeatureEnabled("listening"),
  );
  const [data, setData] = useState<{
    count: number;
    alerts: OpenAlert[];
  } | null>(null);
  const load = useCallback(async () => {
    const r = await getJson<{ count: number; alerts: OpenAlert[] }>(
      "/api/alerts/open",
    );
    if (r.ok) setData(r.data);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    const onFocus = () => void load();
    const onChange = () => void load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("ballo:alerts-changed", onChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("ballo:alerts-changed", onChange);
    };
  }, [enabled, load]);

  if (!enabled || !data || data.count === 0) return null;
  const top = data.alerts[0];
  const more = data.count - 1;
  return (
    <div
      className={`alert-banner alert-banner-${top.severity.toLowerCase()} mb-3`}
      role="alert"
    >
      <i
        className={`ph-duotone ${top.severity === "CRISIS" ? "ph-siren" : "ph-warning"} f-22`}
        aria-hidden="true"
      />
      <div className="flex-grow-1">
        <strong>
          {SEVERITY_LABEL[top.severity]}: {top.brandName}
        </strong>
        <span className="ms-2">{alertSubject(top)}</span>
        {more > 0 && (
          <span className="ms-2 small">
            and {more} more open alert{more === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <Link
        href={`/listening/alerts?alert=${top.id}`}
        className="btn btn-sm btn-light"
      >
        View alert
      </Link>
    </div>
  );
}
