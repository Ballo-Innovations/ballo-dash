/** Sources page (M-03) data and small display helpers. */
export type SourceKind = "LIVE" | "IMPORT" | "SIMULATED" | "STUB";

export interface LastRun {
  status: "RUNNING" | "SUCCEEDED" | "FAILED" | string;
  startedAt: string;
  finishedAt: string | null;
  itemsIn: number;
  itemsNew: number;
  error: string | null;
}

export interface FeedConfig {
  url: string;
  outlet?: string;
  reach?: number;
}

export interface SourceRow {
  id: string;
  name: string;
  kind: SourceKind;
  channel: string;
  enabled: boolean;
  lastRunAt: string | null;
  config: {
    connector?: string;
    intervalMinutes?: number;
    feeds?: (FeedConfig | string)[];
    [key: string]: unknown;
  };
  lastRun: LastRun | null;
}

export interface Health {
  worker: { lastSeenAt: string | null; healthy: boolean };
  sources: SourceRow[];
}

export interface TrackerSite {
  id: string;
  name: string;
  key: string;
  domains: string[];
  enabled: boolean;
  events24h?: number;
  embed: string;
}

/** Sources the worker runs on a schedule (imports run on upload, stubs never). */
export function canRun(kind: SourceKind): boolean {
  return kind === "LIVE" || kind === "SIMULATED";
}

/** "just now", "5 min ago", "3 h ago", "2 days ago". */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Feeds from a news source's config, which may hold plain URLs or objects. */
export function feedList(config: SourceRow["config"]): FeedConfig[] {
  return (config.feeds ?? []).map((f) =>
    typeof f === "string" ? { url: f } : f,
  );
}

/** "every 10 min", "every 2 h". */
export function cadence(config: SourceRow["config"], kind: SourceKind): string {
  if (!canRun(kind)) return kind === "IMPORT" ? "on upload" : "never";
  const m =
    Number(config.intervalMinutes) >= 1 ? Number(config.intervalMinutes) : 10;
  return m % 60 === 0 ? `every ${m / 60} h` : `every ${m} min`;
}
