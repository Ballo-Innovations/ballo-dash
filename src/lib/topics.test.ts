import { describe, expect, it } from "vitest";
import { versusUsual } from "./topics";

describe("versusUsual", () => {
  it("compares the latest window with the average of the earlier ones", () => {
    expect(versusUsual([2, 4, 3, 9])).toBe("3x usual");
    expect(versusUsual([10, 10, 25])).toBe("2.5x usual");
    expect(versusUsual([1, 1, 40])).toBe("40x usual");
    expect(versusUsual([0, 0, 5])).toBe("new");
    expect(versusUsual([0, 0, 0])).toBeNull();
    expect(versusUsual([5])).toBeNull();
  });
});
