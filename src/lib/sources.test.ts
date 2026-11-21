import { describe, expect, it } from "vitest";
import { ago, cadence, canRun, feedList } from "./sources";

describe("sources helpers", () => {
  const now = Date.parse("2026-11-21T12:00:00Z");
  it("says how long ago, in plain words", () => {
    expect(ago(null, now)).toBe("never");
    expect(ago("2026-11-21T11:59:30Z", now)).toBe("just now");
    expect(ago("2026-11-21T11:55:00Z", now)).toBe("5 min ago");
    expect(ago("2026-11-21T09:00:00Z", now)).toBe("3 h ago");
    expect(ago("2026-11-19T12:00:00Z", now)).toBe("2 days ago");
  });
  it("knows which sources run and how often", () => {
    expect(canRun("LIVE")).toBe(true);
    expect(canRun("IMPORT")).toBe(false);
    expect(cadence({ intervalMinutes: 60 }, "LIVE")).toBe("every 1 h");
    expect(cadence({}, "LIVE")).toBe("every 10 min");
    expect(cadence({}, "IMPORT")).toBe("on upload");
    expect(cadence({}, "STUB")).toBe("never");
  });
  it("reads feeds given as URLs or objects", () => {
    expect(
      feedList({
        feeds: [
          "https://a.com/feed",
          { url: "https://b.com/rss", outlet: "B" },
        ],
      }),
    ).toEqual([
      { url: "https://a.com/feed" },
      { url: "https://b.com/rss", outlet: "B" },
    ]);
    expect(feedList({})).toEqual([]);
  });
});
