import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore, checkRateLimit, clientIp } from "./rate-limit";

describe("checkRateLimit", () => {
  const rule = { name: "login", limit: 3, windowSeconds: 60 };

  it("allows up to the limit then blocks with Retry-After", async () => {
    let now = 1_000_000_000;
    const clock = () => now;
    const store = new MemoryRateLimitStore(clock);
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await checkRateLimit(rule, "1.2.3.4", store, clock));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[2].remaining).toBe(0);
    expect(results[3].retryAfterSeconds).toBeGreaterThan(0);
    expect(results[3].retryAfterSeconds).toBeLessThanOrEqual(60);

    now += 60_000;
    expect((await checkRateLimit(rule, "1.2.3.4", store, clock)).allowed).toBe(true);
  });

  it("counts identities and rules separately", async () => {
    const store = new MemoryRateLimitStore();
    for (let i = 0; i < 3; i++) await checkRateLimit(rule, "a", store);
    expect((await checkRateLimit(rule, "a", store)).allowed).toBe(false);
    expect((await checkRateLimit(rule, "b", store)).allowed).toBe(true);
    expect((await checkRateLimit({ ...rule, name: "signup" }, "a", store)).allowed).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for address", () => {
    expect(clientIp({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" })).toBe("203.0.113.5");
    expect(clientIp({ "x-real-ip": "198.51.100.2" })).toBe("198.51.100.2");
    expect(clientIp({})).toBe("unknown");
  });
});
