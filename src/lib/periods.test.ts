import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRange,
  percentChange,
  periodRange,
  previousPeriod,
  startOfLocalDay,
  zoneOffsetMinutes,
} from "./periods";

const iso = (date: Date) => date.toISOString();

describe("zones", () => {
  it("knows Lusaka is UTC+2 all year", () => {
    expect(zoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(120);
    expect(zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });

  it("puts local midnight in Lusaka at 22:00 UTC the day before", () => {
    expect(iso(startOfLocalDay(2026, 11, 20))).toBe("2026-11-19T22:00:00.000Z");
  });

  it("displays UTC instants in the company zone", () => {
    expect(formatDate("2026-11-19T23:30:00Z")).toBe("20 Nov 2026");
    expect(formatDateTime("2026-11-19T23:30:00Z")).toBe("20 Nov 2026, 01:30");
  });
});

describe("periodRange in Lusaka", () => {
  const at = new Date("2026-11-20T10:00:00Z"); // Friday

  it("day", () => {
    const range = periodRange("day", at);
    expect([iso(range.start), iso(range.end)]).toEqual([
      "2026-11-19T22:00:00.000Z",
      "2026-11-20T22:00:00.000Z",
    ]);
  });

  it("week starts on Monday", () => {
    const range = periodRange("week", at);
    expect([iso(range.start), iso(range.end)]).toEqual([
      "2026-11-15T22:00:00.000Z",
      "2026-11-22T22:00:00.000Z",
    ]);
    expect(formatRange("week", range)).toBe("16 to 22 Nov 2026");
  });

  it("month and quarter", () => {
    expect(iso(periodRange("month", at).start)).toBe(
      "2026-10-31T22:00:00.000Z",
    );
    expect(iso(periodRange("month", at).end)).toBe("2026-11-30T22:00:00.000Z");
    expect(iso(periodRange("quarter", at).start)).toBe(
      "2026-09-30T22:00:00.000Z",
    );
    expect(iso(periodRange("quarter", at).end)).toBe(
      "2026-12-31T22:00:00.000Z",
    );
    expect(formatRange("quarter", periodRange("quarter", at))).toBe("Q4 2026");
  });

  it("uses the local date, not the UTC date, near midnight", () => {
    // 23:30 UTC on 31 Jan is already 1 Feb in Lusaka.
    const range = periodRange("month", new Date("2026-01-31T23:30:00Z"));
    expect(formatRange("month", range)).toBe("Feb 2026");
  });
});

describe("month boundaries", () => {
  it("previous month of March is February, including leap years", () => {
    const march2028 = periodRange("month", new Date("2028-03-10T12:00:00Z"));
    const feb = previousPeriod("month", march2028);
    expect([iso(feb.start), iso(feb.end)]).toEqual([
      "2028-01-31T22:00:00.000Z",
      "2028-02-29T22:00:00.000Z",
    ]);
  });

  it("previous of January is December of the year before", () => {
    const prev = previousPeriod(
      "month",
      periodRange("month", new Date("2027-01-05T12:00:00Z")),
    );
    expect(formatRange("month", prev)).toBe("Dec 2026");
  });

  it("previous quarter and week", () => {
    expect(
      formatRange(
        "quarter",
        previousPeriod(
          "quarter",
          periodRange("quarter", new Date("2027-02-01T12:00:00Z")),
        ),
      ),
    ).toBe("Q4 2026");
    const week = periodRange("week", new Date("2026-12-02T12:00:00Z"));
    expect(formatRange("week", previousPeriod("week", week))).toBe(
      "23 to 29 Nov 2026",
    );
    expect(
      formatRange(
        "week",
        periodRange("week", new Date("2026-12-31T12:00:00Z")),
      ),
    ).toBe("28 Dec to 3 Jan 2027");
  });
});

describe("DST boundaries (Europe/London)", () => {
  const zone = "Europe/London";

  it("the spring-forward day is 23 hours long", () => {
    const day = periodRange("day", new Date("2026-03-29T12:00:00Z"), zone);
    expect([iso(day.start), iso(day.end)]).toEqual([
      "2026-03-29T00:00:00.000Z",
      "2026-03-29T23:00:00.000Z",
    ]);
  });

  it("the fall-back day is 25 hours long", () => {
    const day = periodRange("day", new Date("2026-10-25T12:00:00Z"), zone);
    expect(day.end.getTime() - day.start.getTime()).toBe(25 * 3600 * 1000);
  });

  it("a month spanning the change starts and ends on local midnights", () => {
    const march = periodRange("month", new Date("2026-03-15T12:00:00Z"), zone);
    expect([iso(march.start), iso(march.end)]).toEqual([
      "2026-03-01T00:00:00.000Z",
      "2026-03-31T23:00:00.000Z",
    ]);
  });
});

describe("percentChange", () => {
  it("compares against the previous period", () => {
    expect(percentChange(125, 100)).toBe(0.25);
    expect(percentChange(50, 100)).toBe(-0.5);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(10, 0)).toBeNull();
  });
});
