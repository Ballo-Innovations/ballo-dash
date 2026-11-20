/**
 * Shared page filters (F-11), kept in the URL so every page reads the same values and links share them:
 *   ?period=7d|30d|90d|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&brand=<brand id>
 * `to` is inclusive for people; ranges returned here are half-open UTC instants (see periods.ts).
 */
import {
  DEFAULT_TIMEZONE,
  localDate,
  startOfLocalDay,
  type Range,
} from "./periods";

export const PERIOD_PRESETS = ["7d", "30d", "90d"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
export type PeriodChoice = PeriodPreset | "custom";

export interface Filters {
  period: PeriodChoice;
  from?: string;
  to?: string;
  brand?: string;
}

export const DEFAULT_FILTERS: Filters = { period: "30d" };
export const PERIOD_LABELS: Record<PeriodChoice, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value: string | undefined): string | undefined {
  if (!value || !ISO_DATE.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y &&
    check.getUTCMonth() === m - 1 &&
    check.getUTCDate() === d
    ? value
    : undefined;
}

/** Reads filters from a Next.js router query. Anything invalid falls back to the defaults. */
export function parseFilters(
  query: Record<string, string | string[] | undefined>,
): Filters {
  const period = first(query.period);
  const brand = first(query.brand);
  const filters: Filters = { period: DEFAULT_FILTERS.period };
  if (brand && UUID.test(brand)) filters.brand = brand;
  if (period && (PERIOD_PRESETS as readonly string[]).includes(period))
    filters.period = period as PeriodPreset;
  if (period === "custom") {
    const from = validDate(first(query.from));
    const to = validDate(first(query.to));
    if (from && to && from <= to)
      Object.assign(filters, { period: "custom", from, to });
  }
  return filters;
}

/** Query params for the filters; the default period is left out so plain URLs stay plain. */
export function filtersToQuery(filters: Filters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.period === "custom" && filters.from && filters.to)
    Object.assign(query, {
      period: "custom",
      from: filters.from,
      to: filters.to,
    });
  else if (
    filters.period !== DEFAULT_FILTERS.period &&
    filters.period !== "custom"
  )
    query.period = filters.period;
  if (filters.brand) query.brand = filters.brand;
  return query;
}

/**
 * The time range the filters select. Presets end at the end of today in the company zone and cover
 * that many whole days, today included. Custom covers `from` through `to`, both whole days.
 */
export function resolveRange(
  filters: Filters,
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): Range {
  if (filters.period === "custom" && filters.from && filters.to) {
    const [fy, fm, fd] = filters.from.split("-").map(Number);
    const [ty, tm, td] = filters.to.split("-").map(Number);
    return {
      start: startOfLocalDay(fy, fm, fd, timeZone),
      end: startOfLocalDay(ty, tm, td + 1, timeZone),
    };
  }
  const days = Number.parseInt(filters.period, 10) || 30;
  const today = localDate(now, timeZone);
  return {
    start: startOfLocalDay(
      today.year,
      today.month,
      today.day - days + 1,
      timeZone,
    ),
    end: startOfLocalDay(today.year, today.month, today.day + 1, timeZone),
  };
}

/** The same-length range just before, for comparisons. */
export function priorRange(range: Range): Range {
  const length = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - length),
    end: new Date(range.start.getTime()),
  };
}
