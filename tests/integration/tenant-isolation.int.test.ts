import { beforeEach, describe, expect, it } from "vitest";
import { call, createTenant, resetDatabase, signInAs, type TestTenant } from "./helpers";
import { pool } from "@/db/db";
import integrationsIndex from "@/pages/api/integrations/index";
import integrationById from "@/pages/api/integrations/[id]";
import modalData from "@/pages/api/integrations/modal-data";
import modalUpdate from "@/pages/api/integrations/modal-update";
import planHandler from "@/pages/api/plan";
import companyHandler from "@/pages/api/company";
import userHandler from "@/pages/api/user";

let acme: TestTenant;
let zed: TestTenant;

beforeEach(async () => {
  await resetDatabase();
  acme = await createTenant("Acme");
  zed = await createTenant("Zed");
});

describe("integrations API", () => {
  it("creates an integration, stores the token encrypted and never returns it", async () => {
    signInAs(acme);
    const created = await call(integrationsIndex, {
      method: "POST",
      body: { type: "FACEBOOK", status: "CONNECTED", accessToken: "EAAB-acme-token", appSecret: "acme-app-secret" },
    });
    expect(created.status).toBe(201);
    expect(JSON.stringify(created.body)).not.toContain("EAAB-acme-token");
    expect(created.body).toMatchObject({ hasAccessToken: true, hasAppSecret: true, companyId: acme.companyId });

    const raw = await pool.query("SELECT access_token, app_secret FROM integrations WHERE id = $1", [created.body.id]);
    expect(raw.rows[0].access_token).toMatch(/^enc:v1:/);
    expect(raw.rows[0].app_secret).toMatch(/^enc:v1:/);

    const { getFacebookAccessToken } = await import("@/lib/facebook");
    expect(await getFacebookAccessToken(acme.companyId)).toBe("EAAB-acme-token");
  });

  it("rejects a duplicate integration type with 409", async () => {
    signInAs(acme);
    const body = { type: "X", accessToken: "t1" };
    expect((await call(integrationsIndex, { method: "POST", body })).status).toBe(201);
    expect((await call(integrationsIndex, { method: "POST", body })).status).toBe(409);
  });

  it("keeps a saved token when the modal sends an empty field", async () => {
    signInAs(acme);
    const created = await call(integrationsIndex, { method: "POST", body: { type: "LINKEDIN", accessToken: "keep-me" } });
    const updated = await call(modalUpdate, { method: "PUT", query: { id: created.body.id }, body: { accessToken: "", handle: "acme" } });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ handle: "acme", hasAccessToken: true });
    const { getLinkedInAccessToken } = await import("@/lib/linkedin");
    expect(await getLinkedInAccessToken(acme.companyId)).toBe("keep-me");
  });

  it("never shows or changes another company's integrations", async () => {
    signInAs(zed);
    const zedIntegration = await call(integrationsIndex, { method: "POST", body: { type: "FACEBOOK", accessToken: "zed-token" } });

    signInAs(acme);
    const list = await call(integrationsIndex, { query: { companyId: zed.companyId } });
    expect(list.status).toBe(200);
    expect(list.body).toEqual([]);
    expect((await call(modalData)).body).toEqual([]);

    const id = zedIntegration.body.id;
    expect((await call(integrationById, { query: { id } })).status).toBe(404);
    expect((await call(integrationById, { method: "PUT", query: { id }, body: { status: "ERROR" } })).status).toBe(404);
    expect((await call(modalUpdate, { method: "PUT", query: { id }, body: { accessToken: "hijack" } })).status).toBe(404);
    expect((await call(integrationById, { method: "DELETE", query: { id } })).status).toBe(404);

    signInAs(zed);
    const still = await call(integrationById, { query: { id } });
    expect(still.status).toBe(200);
    expect(still.body.status).toBe("PENDING");
  });

  it("requires the integrations.manage capability to change integrations", async () => {
    signInAs(acme, "ANALYST");
    expect((await call(integrationsIndex, { method: "POST", body: { type: "X", accessToken: "t" } })).status).toBe(403);
    expect((await call(modalData)).status).toBe(403);
    expect((await call(integrationsIndex)).status).toBe(200);
  });

  it("rejects anonymous callers", async () => {
    signInAs(null);
    expect((await call(integrationsIndex)).status).toBe(401);
  });
});

describe("plans API", () => {
  const plan = { timeframe: "weekly", periodStart: "2026-11-16T00:00:00.000Z", periodEnd: "2026-11-22T23:59:59.000Z", tasks: [] };

  it("scopes plans to the session company and ignores a companyId in the body", async () => {
    signInAs(acme);
    const created = await call(planHandler, { method: "POST", body: { ...plan, companyId: zed.companyId } });
    expect(created.status).toBe(201);
    expect(created.body.companyId).toBe(acme.companyId);

    signInAs(zed);
    expect((await call(planHandler, { query: { timeframe: "weekly", periodStart: plan.periodStart } })).body).toBeNull();
    expect((await call(planHandler, { method: "DELETE", query: { id: created.body.id } })).status).toBe(404);
    expect((await call(planHandler, { method: "PUT", query: { id: created.body.id }, body: plan })).status).toBe(404);

    signInAs(acme);
    const fetched = await call(planHandler, { query: { timeframe: "weekly", periodStart: plan.periodStart } });
    expect(fetched.body.id).toBe(created.body.id);
  });

  it("validates the period", async () => {
    signInAs(acme);
    const bad = await call(planHandler, { method: "POST", body: { ...plan, periodEnd: "2026-11-01T00:00:00.000Z" } });
    expect(bad.status).toBe(422);
  });
});

describe("company and user API", () => {
  it("returns only the caller's own company and user", async () => {
    signInAs(acme);
    const company = await call(companyHandler);
    expect(company.body.company).toMatchObject({ id: acme.companyId, name: "Acme" });
    const user = await call(userHandler);
    expect(user.body.user).toMatchObject({ id: acme.userId, companyId: acme.companyId });
    expect(JSON.stringify(user.body)).not.toContain("passwordHash");
  });

  it("refuses logo URLs that were not uploaded for this company", async () => {
    signInAs(acme);
    const result = await call(companyHandler, { method: "PATCH", body: { logoUrl: "https://evil.example/logo.png" } });
    expect(result.status).toBe(400);
  });

  it("does not let a read-only user edit the company", async () => {
    signInAs(acme, "READONLY");
    expect((await call(companyHandler, { method: "PATCH", body: { name: "Renamed" } })).status).toBe(403);
  });
});
