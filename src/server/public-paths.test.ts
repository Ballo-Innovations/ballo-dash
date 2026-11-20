import { describe, expect, it } from "vitest";
import { isApiPath, isPublicPath } from "./public-paths";

describe("isPublicPath", () => {
  it.each([
    "/login",
    "/signup",
    "/api/auth/session",
    "/api/auth/callback/credentials",
    "/api/collect",
    "/api/health",
    "/api/public/signup",
    "/s/nps-2026",
    "/t.js",
    "/_next/static/chunks/main.js",
    "/videos/background.mp4",
  ])("allows %s", (path) => {
    expect(isPublicPath(path)).toBe(true);
  });

  it.each([
    "/",
    "/dashboard",
    "/data",
    "/statistics",
    "/reports/facebook",
    "/admin",
    "/api/company",
    "/api/user",
    "/api/integrations",
    "/api/plan",
    "/api/uploads/company-image",
    "/api/data/facebook/stats",
    "/api/debug/session",
    "/loginx",
    "/api/collector",
    "/s",
    "/api/public/../company",
    "/s//api/company",
  ])("protects %s", (path) => {
    expect(isPublicPath(path)).toBe(false);
  });
});

describe("isApiPath", () => {
  it("matches API routes only", () => {
    expect(isApiPath("/api/company")).toBe(true);
    expect(isApiPath("/api")).toBe(true);
    expect(isApiPath("/apiary")).toBe(false);
    expect(isApiPath("/dashboard")).toBe(false);
  });
});
