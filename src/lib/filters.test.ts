import { describe, expect, it } from "vitest";
import {
  filtersToQuery,
  parseFilters,
  priorRange,
  resolveRange,
} from "./filters";

const brand = "6f1c2a52-8d2b-4c3e-9a51-0b6f4c1d2e3f";

describe("parseFilters", () => {
  it("defaults to the last 30 days and no brand", () => {
    expect(parseFilters({})).toEqual({ period: "30d" });
  });

  it("reads presets, custom ranges and a brand", () => {
    expect(parseFilters({ period: "7d", brand })).toEqual({
      period: "7d",
      brand,
    });
    expect(
      parseFilters({ period: "custom", from: "2026-11-01", to: "2026-11-15" }),
    ).toEqual({ period: "custom", from: "2026-11-01", to: "2026-11-15" });
  });

  it("ignores anything invalid", () => {
    expect(parseFilters({ period: "365d" })).toEqual({ period: "30d" });
    expect(
      parseFilters({ period: "custom", from: "2026-11-15", to: "2026-11-01" }),
    ).toEqual({ period: "30d" });
    expect(
      parseFilters({ period: "custom", from: "2026-02-30", to: "2026-03-01" }),
    ).toEqual({ period: "30d" });
    expect(parseFilters({ brand: "'; drop table" })).toEqual({ period: "30d" });
    expect(parseFilters({ period: ["90d", "7d"] })).toEqual({ period: "90d" });
  });
});

describe("filtersToQuery", () => {
  it("round-trips and keeps default URLs clean", () => {
    expect(filtersToQuery({ period: "30d" })).toEqual({});
    const custom = {
      period: "custom" as const,
      from: "2026-11-01",
      to: "2026-11-15",
      brand,
    };
    expect(parseFilters(filtersToQuery(custom))).toEqual(custom);
    expect(filtersToQuery({ period: "custom" })).toEqual({});
  });
});

describe("resolveRange in Lusaka", () => {
  const now = new Date("2026-11-20T10:00:00Z");

  it("7 days includes today", () => {
    const range = resolveRange({ period: "7d" }, now);
    expect(range.start.toISOString()).toBe("2026-11-13T22:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-11-20T22:00:00.000Z");
  });

  it("custom covers both end days", () => {
    const range = resolveRange(
      { period: "custom", from: "2026-11-01", to: "2026-11-01" },
      now,
    );
    expect(range.end.getTime() - range.start.getTime()).toBe(24 * 3600 * 1000);
    expect(range.start.toISOString()).toBe("2026-10-31T22:00:00.000Z");
  });

  it("the prior range has the same length and ends where this one starts", () => {
    const range = resolveRange({ period: "30d" }, now);
    const prior = priorRange(range);
    expect(prior.end).toEqual(range.start);
    expect(prior.end.getTime() - prior.start.getTime()).toBe(
      range.end.getTime() - range.start.getTime(),
    );
  });
});
