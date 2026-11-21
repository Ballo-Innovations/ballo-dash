/** Alerts (L-06) as the API returns them, and small helpers for the banner, list and drawer. */
import type { Mention } from "./mentions";

export type Severity = "WATCH" | "WARNING" | "CRISIS";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

export interface AlertSummary {
  id: string;
  severity: Severity;
  status: AlertStatus;
  topic: string | null;
  aspect: string | null;
  region: string | null;
  zScore: number;
  negVolume: number;
  reachNeg: number;
  openedAt: string;
  brand: { id: string; name: string; isSelf: boolean };
  assignee: { id: string; name: string } | null;
}

export interface TimelineEntry {
  action: string;
  at: string;
  actor: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface AlertDetail extends Omit<AlertSummary, "assignee"> {
  velocity: number;
  recommendedResponse: string | null;
  narrative: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  assignee: { id: string; name: string } | null;
  evidence: Mention[];
  hourly: number[];
  timeline: TimelineEntry[];
}

export interface OpenAlert {
  id: string;
  severity: Severity;
  topic: string | null;
  aspect: string | null;
  region: string | null;
  openedAt: string;
  brandName: string;
}

/** Roles allowed to change an alert (the API's alerts.manage). */
export const ALERT_MANAGERS = ["ADMIN", "MANAGER", "COMMS"];
export function canManageAlerts(role: string | undefined): boolean {
  return ALERT_MANAGERS.includes((role ?? "").toUpperCase());
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  WATCH: "Watch",
  WARNING: "Warning",
  CRISIS: "Crisis",
};
export const STATUS_LABEL: Record<AlertStatus, string> = {
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
};

/** "Network reliability in Copperbelt (#zednet)" style one-liner. */
export function alertSubject(a: {
  topic: string | null;
  aspect: string | null;
  region: string | null;
}): string {
  const what = a.aspect
    ? a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1)
    : (a.topic ?? "Negative spike");
  const where = a.region ? ` in ${a.region}` : "";
  const tag = a.aspect && a.topic ? ` (${a.topic})` : "";
  return `${what}${where}${tag}`;
}

/** Plain words for an audit timeline entry. */
export function describeChange(
  entry: TimelineEntry,
  assignees: Map<string, string> = new Map(),
): string {
  const who = entry.actor ?? "Ballo Dash";
  const after = entry.after ?? {};
  switch (entry.action) {
    case "create":
      return `Alert raised${after.reason ? `: ${String(after.reason)}` : ""}`;
    case "escalate":
      return `Escalated to ${String(after.severity ?? "").toLowerCase()}${after.reason ? `: ${String(after.reason)}` : ""}`;
    case "refresh":
      return "Figures updated by the detector";
    case "acknowledge":
      return `${who} acknowledged it`;
    case "resolve":
      return `${who} resolved it`;
    case "reopen":
      return `${who} reopened it`;
    case "assign": {
      const id = after.assigneeId as string | null | undefined;
      return id
        ? `${who} assigned it to ${assignees.get(id) ?? "a team member"}`
        : `${who} removed the assignee`;
    }
    case "edit_response":
      return `${who} edited the recommended response`;
    default:
      return `${who}: ${entry.action.replace(/_/g, " ")}`;
  }
}
