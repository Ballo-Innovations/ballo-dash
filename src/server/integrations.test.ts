import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/db", () => ({ db: {} }));

import { buildIntegrationUpdate, createIntegrationSchema, toPublicIntegration, updateIntegrationSchema } from "./integrations";

const row = {
  id: "i1",
  type: "FACEBOOK",
  status: "CONNECTED",
  handle: "ballo",
  appId: "123",
  appSecret: "app-secret",
  accessToken: "EAAB-secret",
  refreshToken: null,
  expiresAt: null,
  lastSyncedAt: null,
  accountId: "page-1",
  metadata: {},
  companyId: "c1",
  createdAt: null,
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

describe("toPublicIntegration", () => {
  it("never includes secret values", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = toPublicIntegration(row as any);
    const json = JSON.stringify(out);
    expect(json).not.toContain("EAAB-secret");
    expect(json).not.toContain("app-secret");
    expect(out).toMatchObject({ hasAccessToken: true, hasAppSecret: true, hasRefreshToken: false, accessToken: "", appSecret: "" });
  });
});

describe("buildIntegrationUpdate", () => {
  it("keeps saved secrets when the field is blank or missing", () => {
    const changes = buildIntegrationUpdate(updateIntegrationSchema.parse({ accessToken: "", appSecret: "   ", status: "CONNECTED" }));
    expect(changes).toEqual({ status: "CONNECTED" });
  });

  it("replaces secrets when a new value is given", () => {
    const changes = buildIntegrationUpdate(updateIntegrationSchema.parse({ accessToken: "new-token" }));
    expect(changes).toEqual({ accessToken: "new-token" });
  });

  it("parses expiry dates and allows clearing them", () => {
    expect(buildIntegrationUpdate(updateIntegrationSchema.parse({ expiresAt: "2026-12-01T00:00:00Z" })).expiresAt).toEqual(new Date("2026-12-01T00:00:00Z"));
    expect(buildIntegrationUpdate(updateIntegrationSchema.parse({ expiresAt: null }))).toEqual({ expiresAt: null });
  });

  it("ignores fields it does not know, such as companyId", () => {
    const changes = buildIntegrationUpdate(updateIntegrationSchema.parse({ companyId: "other", handle: "x" }));
    expect(changes).toEqual({ handle: "x" });
  });
});

describe("createIntegrationSchema", () => {
  it("requires a type and access token", () => {
    expect(createIntegrationSchema.safeParse({ type: "FACEBOOK" }).success).toBe(false);
    expect(createIntegrationSchema.safeParse({ type: "MYSPACE", accessToken: "t" }).success).toBe(false);
    expect(createIntegrationSchema.parse({ type: "X", accessToken: "t" }).status).toBe("PENDING");
  });
});
