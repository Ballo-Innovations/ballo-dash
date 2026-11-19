import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("./auth", () => ({ authOptions: {} }));

import { apiHandler, publicRoute, route, type SessionUser } from "./api";
import { ApiError } from "./errors";
import { MemoryRateLimitStore, setRateLimitStore } from "./rate-limit";
import { mockReqRes, testUser } from "./test-utils";
import { setLogSink } from "@/lib/logger";

const as = (user: SessionUser | null) => ({ getSessionUser: async () => user });

afterEach(() => setRateLimitStore(undefined));

describe("apiHandler", () => {
  it("rejects requests without a session by default", async () => {
    const handler = apiHandler({ GET: route({ handler: () => ({ ok: true }) }) }, as(null));
    const { req, res, out } = mockReqRes({});
    await handler(req, res);
    expect(out.statusCode).toBe(401);
    expect(out.body).toEqual({ error: { code: "unauthorized", message: "Sign in to continue" } });
  });

  it("passes the session user, never a request-supplied company id", async () => {
    const user = testUser();
    const handler = apiHandler(
      { GET: route({ query: z.object({}).passthrough(), handler: ({ user }) => ({ companyId: user.companyId }) }) },
      as(user)
    );
    const { req, res, out } = mockReqRes({ query: { companyId: "someone-else" } });
    await handler(req, res);
    expect(out.statusCode).toBe(200);
    expect(out.body).toEqual({ companyId: user.companyId });
  });

  it("allows public routes without a session", async () => {
    const handler = apiHandler({ POST: publicRoute({ handler: ({ user }) => ({ signedIn: user !== null }) }) }, as(null));
    const { req, res, out } = mockReqRes({ method: "POST" });
    await handler(req, res);
    expect(out.statusCode).toBe(201);
    expect(out.body).toEqual({ signedIn: false });
  });

  it("enforces capabilities", async () => {
    const routes = { DELETE: route({ capability: "integrations.manage", handler: () => undefined }) };
    const denied = mockReqRes({ method: "DELETE" });
    await apiHandler(routes, as(testUser({ role: "ANALYST" })))(denied.req, denied.res);
    expect(denied.out.statusCode).toBe(403);

    const allowed = mockReqRes({ method: "DELETE" });
    await apiHandler(routes, as(testUser({ role: "MANAGER" })))(allowed.req, allowed.res);
    expect(allowed.out.statusCode).toBe(204);
  });

  it("validates query and body and reports each issue", async () => {
    const handler = apiHandler(
      {
        POST: route({
          query: z.object({ page: z.coerce.number().int().min(1) }),
          body: z.object({ name: z.string().min(1) }),
          handler: ({ query, body }) => ({ page: query.page, name: body.name }),
        }),
      },
      as(testUser())
    );
    const bad = mockReqRes({ method: "POST", query: { page: "0" }, body: { name: "" } });
    await handler(bad.req, bad.res);
    expect(bad.out.statusCode).toBe(422);
    expect(bad.out.body).toMatchObject({ error: { code: "validation_failed", details: [{ path: "page" }] } });

    const good = mockReqRes({ method: "POST", query: { page: "2" }, body: { name: "Ballo" } });
    await handler(good.req, good.res);
    expect(good.out.body).toEqual({ page: 2, name: "Ballo" });
  });

  it("returns 405 with an Allow header for unsupported methods", async () => {
    const handler = apiHandler({ GET: route({ handler: () => ({}) }) }, as(testUser()));
    const { req, res, out } = mockReqRes({ method: "PUT" });
    await handler(req, res);
    expect(out.statusCode).toBe(405);
    expect(out.headers.allow).toBe("GET");
  });

  it("returns ApiError messages but hides unexpected errors", async () => {
    const lines: string[] = [];
    const restore = setLogSink((_l, line) => lines.push(line));
    const handler = apiHandler(
      {
        GET: route({ handler: () => { throw new ApiError("not_found", "Report not found"); } }),
        POST: route({ handler: () => { throw new Error("connection refused at 10.0.0.5:5432"); } }),
      },
      as(testUser())
    );
    const known = mockReqRes({});
    await handler(known.req, known.res);
    expect(known.out.statusCode).toBe(404);
    expect(known.out.body).toEqual({ error: { code: "not_found", message: "Report not found" } });

    const unknown = mockReqRes({ method: "POST" });
    await handler(unknown.req, unknown.res);
    restore();
    expect(unknown.out.statusCode).toBe(500);
    expect(JSON.stringify(unknown.out.body)).not.toContain("10.0.0.5");
    expect(lines.some((line) => line.includes("unhandled API error"))).toBe(true);
  });

  it("rate limits and sets Retry-After", async () => {
    setRateLimitStore(new MemoryRateLimitStore());
    const handler = apiHandler(
      { POST: publicRoute({ rateLimit: { name: "t", limit: 2, windowSeconds: 60 }, handler: () => ({}) }) },
      as(null)
    );
    const statuses: number[] = [];
    let last;
    for (let i = 0; i < 3; i++) {
      last = mockReqRes({ method: "POST", headers: { "x-forwarded-for": "203.0.113.9" } });
      await handler(last.req, last.res);
      statuses.push(last.out.statusCode);
    }
    expect(statuses).toEqual([201, 201, 429]);
    expect(Number(last!.out.headers["retry-after"])).toBeGreaterThan(0);
  });
});
