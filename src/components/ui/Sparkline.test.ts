import { describe, expect, it } from "vitest";
import { sparklinePoints } from "./Sparkline";

describe("sparklinePoints", () => {
  it("spreads values across the width, highest at the top", () => {
    expect(sparklinePoints([0, 5, 10], 104, 24)).toBe("2,22 52,12 102,2");
  });
  it("draws a flat line in the middle-free bottom for equal values, and nothing for none", () => {
    expect(sparklinePoints([3, 3], 10, 10)).toBe("2,8 8,8");
    expect(sparklinePoints([], 10, 10)).toBe("");
    expect(sparklinePoints([7], 10, 10)).toBe("2,8");
  });
});
