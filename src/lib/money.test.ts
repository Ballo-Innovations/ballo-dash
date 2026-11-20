import { describe, expect, it } from "vitest";
import {
  formatMoney,
  fromMinorUnits,
  minorDigits,
  toMinorUnits,
} from "./money";

describe("formatMoney", () => {
  it("formats ngwee as kwacha by default", () => {
    expect(formatMoney(123450)).toBe("K1,234.50");
    expect(formatMoney(0)).toBe("K0.00");
    expect(formatMoney(null)).toBe("K0.00");
  });

  it("shows negatives", () => {
    expect(formatMoney(-5025)).toBe("-K50.25");
  });

  it("uses the company currency when given", () => {
    expect(formatMoney(199, { currency: "USD", locale: "en-US" })).toBe(
      "$1.99",
    );
    expect(formatMoney(500, { currency: "JPY", locale: "en-US" })).toBe("¥500");
  });

  it("falls back to ZMW when the currency is missing", () => {
    expect(formatMoney(100, { currency: null })).toBe("K1.00");
  });

  it("can trim zero minor units and compact large amounts", () => {
    expect(formatMoney(120000, { trimZeroMinor: true })).toBe("K1,200");
    expect(formatMoney(120050, { trimZeroMinor: true })).toBe("K1,200.50");
    expect(formatMoney(123_456_789_00, { compact: true })).toBe("K123.5M");
  });
});

describe("minor units", () => {
  it("knows currency precision", () => {
    expect(minorDigits("ZMW")).toBe(2);
    expect(minorDigits("JPY")).toBe(0);
  });

  it("converts without floating point drift", () => {
    expect(toMinorUnits(1.005)).toBe(101);
    expect(toMinorUnits(0.1 + 0.2)).toBe(30);
    expect(toMinorUnits(-12.345)).toBe(-1235);
    expect(toMinorUnits(500, "JPY")).toBe(500);
    expect(fromMinorUnits(123450)).toBe(1234.5);
  });
});
