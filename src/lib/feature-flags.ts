/**
 * Feature flags (F-01). See docs/feature-promotion.md.
 *
 * Resolution, first match wins:
 *  1. Browser only: QA override saved from `?features=listening,paid-media`
 *     (or `all` / `none`). Overrides change what the UI shows; they never
 *     unlock an API, because the server ignores them.
 *  2. The NEXT_PUBLIC_FEATURE_* variable ("true"/"1" or "false"/"0").
 *  3. Default: on in development, off everywhere else.
 *
 * Each variable is read with a literal `process.env.NAME` so Next inlines it
 * into the browser bundle.
 */

export const FEATURES = [
  "listening",
  "kpiDashboard",
  "campaigns",
  "paidMedia",
  "competitors",
  "feedback",
  "insights",
  "reportsV2",
  "adminConsole",
  "billing",
] as const;
export type FeatureName = (typeof FEATURES)[number];

function envValues(): Record<FeatureName, string | undefined> {
  return {
    listening: process.env.NEXT_PUBLIC_FEATURE_LISTENING,
    kpiDashboard: process.env.NEXT_PUBLIC_FEATURE_KPI_DASHBOARD,
    campaigns: process.env.NEXT_PUBLIC_FEATURE_CAMPAIGNS,
    paidMedia: process.env.NEXT_PUBLIC_FEATURE_PAID_MEDIA,
    competitors: process.env.NEXT_PUBLIC_FEATURE_COMPETITORS,
    feedback: process.env.NEXT_PUBLIC_FEATURE_FEEDBACK,
    insights: process.env.NEXT_PUBLIC_FEATURE_INSIGHTS,
    reportsV2: process.env.NEXT_PUBLIC_FEATURE_REPORTS_V2,
    adminConsole: process.env.NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE,
    billing: process.env.NEXT_PUBLIC_FEATURE_BILLING,
  };
}

export const FEATURE_ENV_VARS: Record<FeatureName, string> = {
  listening: "NEXT_PUBLIC_FEATURE_LISTENING",
  kpiDashboard: "NEXT_PUBLIC_FEATURE_KPI_DASHBOARD",
  campaigns: "NEXT_PUBLIC_FEATURE_CAMPAIGNS",
  paidMedia: "NEXT_PUBLIC_FEATURE_PAID_MEDIA",
  competitors: "NEXT_PUBLIC_FEATURE_COMPETITORS",
  feedback: "NEXT_PUBLIC_FEATURE_FEEDBACK",
  insights: "NEXT_PUBLIC_FEATURE_INSIGHTS",
  reportsV2: "NEXT_PUBLIC_FEATURE_REPORTS_V2",
  adminConsole: "NEXT_PUBLIC_FEATURE_ADMIN_CONSOLE",
  billing: "NEXT_PUBLIC_FEATURE_BILLING",
};

const ALIASES: Record<string, FeatureName> = {
  listening: "listening",
  "kpi-dashboard": "kpiDashboard",
  kpidashboard: "kpiDashboard",
  dashboard: "kpiDashboard",
  campaigns: "campaigns",
  "paid-media": "paidMedia",
  paidmedia: "paidMedia",
  competitors: "competitors",
  feedback: "feedback",
  surveys: "feedback",
  insights: "insights",
  "reports-v2": "reportsV2",
  reportsv2: "reportsV2",
  admin: "adminConsole",
  "admin-console": "adminConsole",
  billing: "billing",
};

const STORAGE_KEY = "ballo-dash.feature-overrides";

export function resolveFlag(input: { override?: boolean; env?: string; isDevelopment: boolean }): boolean {
  if (typeof input.override === "boolean") return input.override;
  if (input.env === "true" || input.env === "1") return true;
  if (input.env === "false" || input.env === "0") return false;
  return input.isDevelopment;
}

/** Parses `?features=` into overrides. Unknown names are ignored. */
export function parseFeatureParam(raw: string | null | undefined): Partial<Record<FeatureName, boolean>> {
  const overrides: Partial<Record<FeatureName, boolean>> = {};
  if (!raw) return overrides;
  for (const entry of raw.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean)) {
    if (entry === "all" || entry === "none") {
      for (const name of FEATURES) overrides[name] = entry === "all";
      continue;
    }
    const negate = entry.startsWith("-");
    const name = ALIASES[negate ? entry.slice(1) : entry];
    if (name) overrides[name] = !negate;
  }
  return overrides;
}

function readBrowserOverrides(): Partial<Record<FeatureName, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const fromUrl = parseFeatureParam(new URLSearchParams(window.location.search).get("features"));
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    const merged: Partial<Record<FeatureName, boolean>> = {};
    for (const name of FEATURES) {
      if (typeof stored[name] === "boolean") merged[name] = stored[name] as boolean;
    }
    Object.assign(merged, fromUrl);
    if (Object.keys(fromUrl).length > 0) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return {};
  }
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Whether a feature is on. In the browser this includes QA overrides; on the
 * server it never does, so API routes and server-side checks only follow the
 * environment.
 */
export function isFeatureEnabled(name: FeatureName): boolean {
  const overrides = readBrowserOverrides();
  return resolveFlag({ override: overrides[name], env: envValues()[name], isDevelopment });
}

/** Server-side check that ignores browser overrides. Use in API routes and getServerSideProps. */
export function isFeatureEnabledOnServer(name: FeatureName): boolean {
  return resolveFlag({ env: envValues()[name], isDevelopment });
}

/** Drops items (and submenu items) whose `feature` flag is off. Items without a `feature` always stay. */
export function withEnabledFeatures<T extends { feature?: FeatureName; submenu?: T[] }>(
  items: T[],
  enabled: (name: FeatureName) => boolean = isFeatureEnabled
): T[] {
  return items
    .filter((item) => !item.feature || enabled(item.feature))
    .map((item) => (item.submenu ? { ...item, submenu: withEnabledFeatures(item.submenu, enabled) } : item));
}
