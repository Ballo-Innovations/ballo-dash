/**
 * Dates and period ranges (F-09). Store and send instants in UTC; display and bucket them in the
 * company's time zone (companies.timezone, Africa/Lusaka by default). Ranges are half-open:
 * start <= t < end, both UTC instants that fall on local midnights.
 */
export const DEFAULT_TIMEZONE = "Africa/Lusaka";

export type PeriodKind = "day" | "week" | "month" | "quarter";
export interface Range {
  start: Date;
  end: Date;
}

interface LocalParts {
  year: number;
  month: number; // 1-12
  day: number;
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatters.set(timeZone, formatter);
  }
  return formatter;
}

function wallClock(instant: Date, timeZone: string) {
  const parts = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Offset of the zone from UTC at `instant`, in minutes (Lusaka is +120). */
export function zoneOffsetMinutes(
  instant: Date,
  timeZone: string = DEFAULT_TIMEZONE,
): number {
  const local = wallClock(instant, timeZone);
  const asUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );
  return Math.round(
    (asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000,
  );
}

/** The local calendar date of an instant in a zone. */
export function localDate(
  instant: Date,
  timeZone: string = DEFAULT_TIMEZONE,
): LocalParts {
  const { year, month, day } = wallClock(instant, timeZone);
  return { year, month, day };
}

/** UTC instant of local midnight at the start of the given local date (month and day may overflow). */
export function startOfLocalDay(
  year: number,
  month: number,
  day: number,
  timeZone: string = DEFAULT_TIMEZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day);
  // Two passes settle the offset even when midnight sits next to a DST change.
  let instant = guess - zoneOffsetMinutes(new Date(guess), timeZone) * 60000;
  instant = guess - zoneOffsetMinutes(new Date(instant), timeZone) * 60000;
  return new Date(instant);
}

/** The period of `kind` containing `at`, in the zone's calendar. Weeks start on Monday. */
export function periodRange(
  kind: PeriodKind,
  at: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): Range {
  const { year, month, day } = localDate(at, timeZone);
  switch (kind) {
    case "day":
      return {
        start: startOfLocalDay(year, month, day, timeZone),
        end: startOfLocalDay(year, month, day + 1, timeZone),
      };
    case "week": {
      const weekday =
        (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7; // Monday = 0
      return {
        start: startOfLocalDay(year, month, day - weekday, timeZone),
        end: startOfLocalDay(year, month, day - weekday + 7, timeZone),
      };
    }
    case "month":
      return {
        start: startOfLocalDay(year, month, 1, timeZone),
        end: startOfLocalDay(year, month + 1, 1, timeZone),
      };
    case "quarter": {
      const first = Math.floor((month - 1) / 3) * 3 + 1;
      return {
        start: startOfLocalDay(year, first, 1, timeZone),
        end: startOfLocalDay(year, first + 3, 1, timeZone),
      };
    }
  }
}

/** The period just before, for "vs previous period" comparisons (previous calendar month, not 30 days). */
export function previousPeriod(
  kind: PeriodKind,
  range: Range,
  timeZone: string = DEFAULT_TIMEZONE,
): Range {
  const justBefore = new Date(range.start.getTime() - 1);
  return periodRange(kind, justBefore, timeZone);
}

/** Change from the previous value as a fraction (0.25 = +25%); null when there is nothing to compare against. */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / Math.abs(previous);
}

/** "20 Nov 2026" in the company's zone. */
export function formatDate(
  instant: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = "en-GB",
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(instant));
}

/** "20 Nov 2026, 14:05" in the company's zone. */
export function formatDateTime(
  instant: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = "en-GB",
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(instant));
}

/** Label for a range: "Nov 2026", "Q4 2026", "16 to 22 Nov 2026". */
export function formatRange(
  kind: PeriodKind,
  range: Range,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const { year, month } = localDate(range.start, timeZone);
  if (kind === "month")
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      month: "short",
      year: "numeric",
    }).format(range.start);
  if (kind === "quarter") return `Q${Math.floor((month - 1) / 3) + 1} ${year}`;
  if (kind === "day") return formatDate(range.start, timeZone);
  const last = new Date(range.end.getTime() - 1);
  const sameMonth = localDate(last, timeZone).month === month;
  const startLabel = new Intl.DateTimeFormat(
    "en-GB",
    sameMonth
      ? { timeZone, day: "numeric" }
      : { timeZone, day: "numeric", month: "short" },
  ).format(range.start);
  return `${startLabel} to ${formatDate(last, timeZone)}`;
}
