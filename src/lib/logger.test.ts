import { afterEach, describe, expect, it, vi } from "vitest";
import { logger, redact, setLogSink } from "./logger";

describe("redact", () => {
  it("replaces values under sensitive keys at any depth", () => {
    const out = redact({
      accessToken: "EAAB123",
      nested: { refresh_token: "r", appSecret: "s", password: "p", ok: 1 },
      list: [{ Authorization: "Bearer x" }],
    });
    expect(out).toEqual({
      accessToken: "[REDACTED]",
      nested: { refresh_token: "[REDACTED]", appSecret: "[REDACTED]", password: "[REDACTED]", ok: 1 },
      list: [{ Authorization: "[REDACTED]" }],
    });
  });

  it("masks token query parameters and e-mail addresses in strings", () => {
    expect(redact("https://graph.facebook.com/me?fields=id&access_token=EAAB123&x=1")).toBe(
      "https://graph.facebook.com/me?fields=id&access_token=[REDACTED]&x=1"
    );
    expect(redact("user natasha@example.zm logged in")).toBe("user n***@example.zm logged in");
  });

  it("handles errors, dates, cycles and deep objects without throwing", () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    expect(redact(cyclic)).toEqual({ a: 1, self: "[Circular]" });
    expect(redact(new Error("bad token=abc"))).toEqual({ name: "Error", message: "bad token=abc" });
    expect(redact(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01T00:00:00.000Z");
    let deep: Record<string, unknown> = {};
    const root = deep;
    for (let i = 0; i < 10; i++) {
      deep.next = {};
      deep = deep.next as Record<string, unknown>;
    }
    expect(JSON.stringify(redact(root))).toContain("[Truncated]");
  });

  it("leaves primitives alone", () => {
    expect(redact(5)).toBe(5);
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });
});

describe("logger", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("writes JSON lines with scope and redacted context", () => {
    const lines: string[] = [];
    const restore = setLogSink((_level, line) => lines.push(line));
    logger.child("integrations").info("saved", { accessToken: "x", id: 3 });
    restore();
    const entry = JSON.parse(lines[0]);
    expect(entry).toMatchObject({ level: "info", scope: "integrations", msg: "saved", context: { accessToken: "[REDACTED]", id: 3 } });
  });

  it("accepts console-style calls with several or non-string arguments", () => {
    const entries: Record<string, unknown>[] = [];
    const restore = setLogSink((_level, _line, payload) => entries.push(payload));
    logger.error("failed", "facebook", { token: "t" });
    logger.error(new Error("boom"));
    restore();
    expect(entries[0]).toMatchObject({ msg: "failed", context: ["facebook", { token: "[REDACTED]" }] });
    expect(entries[1]).toMatchObject({ msg: "", context: { name: "Error", message: "boom" } });
  });

  it("drops entries below LOG_LEVEL", () => {
    vi.stubEnv("LOG_LEVEL", "warn");
    const levels: string[] = [];
    const restore = setLogSink((level) => levels.push(level));
    logger.debug("a");
    logger.info("b");
    logger.warn("c");
    logger.error("d");
    restore();
    expect(levels).toEqual(["warn", "error"]);
  });
});
