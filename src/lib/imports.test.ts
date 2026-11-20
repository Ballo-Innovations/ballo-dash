import { describe, expect, it } from "vitest";
import { fileProblem, importUrl, resultSummary, rowErrors } from "./imports";

describe("fileProblem", () => {
  it("accepts CSV files up to 10 MB", () => {
    expect(fileProblem({ name: "ga4.csv", size: 1000 })).toBeNull();
    expect(
      fileProblem({ name: "EXPORT.CSV", size: 10 * 1024 * 1024 }),
    ).toBeNull();
  });
  it("refuses empty, oversized and non-CSV files", () => {
    expect(fileProblem({ name: "a.csv", size: 0 })).toMatch(/empty/);
    expect(fileProblem({ name: "a.csv", size: 10 * 1024 * 1024 + 1 })).toMatch(
      /10 MB/,
    );
    expect(fileProblem({ name: "a.xlsx", size: 5 })).toMatch(/CSV/);
  });
});

describe("importUrl", () => {
  it("builds preview and import urls with the wizard's choices", () => {
    expect(importUrl("ga4", "preview", { gzip: true })).toBe(
      "/api/imports/ga4/preview?gzip=1",
    );
    const url = new URL(
      importUrl("meta", "import", {
        gzip: false,
        mapping: { date: "Day", reach: null },
        dateOrder: "mdy",
      }),
      "http://x",
    );
    expect(url.pathname).toBe("/api/imports/meta");
    expect(JSON.parse(url.searchParams.get("mapping") ?? "")).toEqual({
      date: "Day",
      reach: null,
    });
    expect(url.searchParams.get("dateOrder")).toBe("mdy");
  });
});

describe("rowErrors", () => {
  it("keeps only line errors", () => {
    expect(
      rowErrors({
        code: "validation_failed",
        message: "x",
        details: [
          { line: 2, message: "bad" },
          { path: "mapping", message: "m" },
        ],
      }),
    ).toEqual([{ line: 2, message: "bad" }]);
    expect(rowErrors({ code: "x", message: "y" })).toEqual([]);
  });
});

describe("resultSummary", () => {
  it("describes new, repeated and partly bad imports", () => {
    expect(
      resultSummary(
        { itemsNew: 84, itemsWritten: 84, errorCount: 0 },
        "metrics",
      ),
    ).toBe("Imported 84 new daily values.");
    expect(
      resultSummary(
        { itemsNew: 2, itemsWritten: 8, errorCount: 1 },
        "mentions",
      ),
    ).toBe("Imported 2 new posts, 6 already there. 1 bad row was skipped.");
    expect(
      resultSummary(
        { itemsNew: 0, itemsWritten: 8, errorCount: 0 },
        "mentions",
      ),
    ).toBe("Nothing new: everything in this file was already imported.");
    expect(
      resultSummary(
        { itemsNew: 0, itemsWritten: 84, errorCount: 2 },
        "metrics",
      ),
    ).toMatch(/refreshed\)\. 2 bad rows were skipped\.$/);
  });
});
