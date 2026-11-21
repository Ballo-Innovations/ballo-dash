import { describe, expect, it } from "vitest";
import { barGeometry, score100 } from "./sentiment-summary";

describe("sentiment summary helpers", () => {
  it("shows the index from -100 to +100", () => {
    expect(score100(-0.4321)).toBe("-43");
    expect(score100(0.25)).toBe("+25");
    expect(score100(0)).toBe("0");
    expect(score100(null)).toBe("No data");
  });
  it("draws diverging bars around the middle", () => {
    expect(barGeometry(-0.5)).toEqual({ left: 25, width: 25, tone: "NEG" });
    expect(barGeometry(1)).toEqual({ left: 50, width: 50, tone: "POS" });
    expect(barGeometry(0.1)).toEqual({ left: 50, width: 5, tone: "NEU" });
    expect(barGeometry(-3)).toEqual({ left: 0, width: 50, tone: "NEG" });
    expect(barGeometry(null)).toEqual({ left: 50, width: 0, tone: "NEU" });
  });
});
