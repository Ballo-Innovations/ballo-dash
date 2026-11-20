import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./safe-redirect";

describe("safeCallbackUrl", () => {
  it("keeps relative paths", () => {
    expect(safeCallbackUrl("/reports/facebook?period=7d")).toBe("/reports/facebook?period=7d");
  });

  it.each([null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/ok\nLocation: x"])(
    "sends %s home",
    (value) => {
      expect(safeCallbackUrl(value)).toBe("/");
    }
  );
});
