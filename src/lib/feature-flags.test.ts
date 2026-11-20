import { afterEach, describe, expect, it, vi } from "vitest";
import { FEATURES, FEATURE_ENV_VARS, isFeatureEnabledOnServer, parseFeatureParam, resolveFlag, withEnabledFeatures, type FeatureName } from "./feature-flags";

afterEach(() => vi.unstubAllEnvs());

describe("resolveFlag", () => {
  it("defaults on in development and off elsewhere", () => {
    expect(resolveFlag({ isDevelopment: true })).toBe(true);
    expect(resolveFlag({ isDevelopment: false })).toBe(false);
  });

  it("lets the environment variable win over the default", () => {
    expect(resolveFlag({ env: "true", isDevelopment: false })).toBe(true);
    expect(resolveFlag({ env: "1", isDevelopment: false })).toBe(true);
    expect(resolveFlag({ env: "false", isDevelopment: true })).toBe(false);
    expect(resolveFlag({ env: "yes please", isDevelopment: false })).toBe(false);
  });

  it("lets a QA override win over everything", () => {
    expect(resolveFlag({ override: true, env: "false", isDevelopment: false })).toBe(true);
    expect(resolveFlag({ override: false, env: "true", isDevelopment: true })).toBe(false);
  });
});

describe("parseFeatureParam", () => {
  it("understands names, aliases, negation, all and none", () => {
    expect(parseFeatureParam("listening, paid-media")).toEqual({ listening: true, paidMedia: true });
    expect(parseFeatureParam("all,-billing")).toMatchObject({ listening: true, billing: false });
    expect(Object.values(parseFeatureParam("none")).every((v) => v === false)).toBe(true);
    expect(parseFeatureParam("bogus")).toEqual({});
    expect(parseFeatureParam(null)).toEqual({});
  });
});

describe("isFeatureEnabledOnServer", () => {
  it("follows the environment variable only", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_PAID_MEDIA", "true");
    expect(isFeatureEnabledOnServer("paidMedia")).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_FEATURE_PAID_MEDIA", "false");
    expect(isFeatureEnabledOnServer("paidMedia")).toBe(false);
  });

  it("has an env var for every feature", () => {
    for (const name of FEATURES) expect(FEATURE_ENV_VARS[name]).toMatch(/^NEXT_PUBLIC_FEATURE_[A-Z0-9_]+$/);
  });
});

describe("withEnabledFeatures", () => {
  type Item = { id: string; feature?: FeatureName; submenu?: Item[] };
  const items: Item[] = [
    { id: "dashboard" },
    { id: "listening", feature: "listening" },
    { id: "reports", submenu: [{ id: "overview" }, { id: "v2", feature: "reportsV2" }] },
  ];

  it("keeps everything when every flag is on", () => {
    const result = withEnabledFeatures(items, () => true);
    expect(result.map((item) => item.id)).toEqual(["dashboard", "listening", "reports"]);
    expect(result[2].submenu?.map((item) => item.id)).toEqual(["overview", "v2"]);
  });

  it("drops gated items and gated submenu items when flags are off", () => {
    const result = withEnabledFeatures(items, () => false);
    expect(result.map((item) => item.id)).toEqual(["dashboard", "reports"]);
    expect(result[1].submenu?.map((item) => item.id)).toEqual(["overview"]);
  });

  it("follows the environment by default", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_LISTENING", "false");
    expect(withEnabledFeatures(items).map((item) => item.id)).not.toContain("listening");
  });
});
