import { describe, expect, it } from "vitest";
import {
  compact,
  listeningQuery,
  mentionsUrl,
  parseListeningFilters,
} from "./mentions";

describe("listening filters", () => {
  it("reads valid values from the URL and drops the rest", () => {
    expect(
      parseListeningFilters({
        sentiment: "NEG,ANGRY,NEG,POS",
        channel: "X,facebook",
        topic: "outage",
        region: "Lusaka",
        q: "  fibre ",
        page: "3",
      }),
    ).toEqual({
      sentiment: ["NEG", "POS"],
      channel: ["X"],
      topic: ["outage"],
      region: ["Lusaka"],
      q: "fibre",
      page: 3,
    });
    expect(parseListeningFilters({ page: "-1" }).page).toBe(1);
    expect(parseListeningFilters({ page: "abc" }).page).toBe(1);
    expect(parseListeningFilters({})).toEqual({
      sentiment: [],
      channel: [],
      topic: [],
      region: [],
      q: "",
      page: 1,
    });
  });

  it("writes only non-default values back", () => {
    expect(listeningQuery(parseListeningFilters({}))).toEqual({});
    expect(
      listeningQuery(
        parseListeningFilters({ sentiment: "NEG", page: "2", q: "x" }),
      ),
    ).toEqual({ sentiment: "NEG", q: "x", page: "2" });
  });

  it("builds the API request with the period, brand and page size", () => {
    const url = new URL(
      mentionsUrl(
        {
          start: new Date("2026-11-01T00:00:00Z"),
          end: new Date("2026-11-21T00:00:00Z"),
        },
        "b1",
        parseListeningFilters({
          sentiment: "NEG",
          channel: "X,NEWS",
          page: "2",
        }),
      ),
      "http://x",
    );
    expect(url.pathname).toBe("/api/mentions");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from: "2026-11-01T00:00:00.000Z",
      to: "2026-11-21T00:00:00.000Z",
      brand: "b1",
      sentiment: "NEG",
      channel: "X,NEWS",
      page: "2",
      pageSize: "25",
    });
  });

  it("formats big numbers compactly", () => {
    expect(compact(950)).toBe("950");
    expect(compact(12_400)).toBe("12.4K");
    expect(compact(2_000_000)).toBe("2M");
  });
});
