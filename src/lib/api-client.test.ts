import { afterEach, describe, expect, it, vi } from "vitest";
import { fieldErrors, postJson } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

describe("postJson", () => {
  it("returns data on success and the API error otherwise", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: 1 }), { status: 202 })));
    expect(await postJson("/api/x", {})).toEqual({ ok: true, status: 202, data: { ok: 1 } });

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { code: "forbidden", message: "No" } }), { status: 403 })));
    expect(await postJson("/api/x", {})).toEqual({ ok: false, status: 403, error: { code: "forbidden", message: "No" } });
  });

  it("reports network failures and non-JSON errors in plain words", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    expect((await postJson("/api/x", {})) as { error: { code: string } }).toMatchObject({ ok: false, status: 0, error: { code: "network" } });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 502 })));
    expect(await postJson("/api/x", {})).toMatchObject({ ok: false, status: 502, error: { code: "internal" } });
  });
});

describe("fieldErrors", () => {
  it("maps validation details to the first message per field", () => {
    expect(
      fieldErrors({
        code: "validation_failed",
        message: "Invalid request",
        details: [
          { path: "email", message: "Enter a valid email address" },
          { path: "password", message: "Use at least 10 characters" },
          { path: "password", message: "second" },
        ],
      })
    ).toEqual({ email: "Enter a valid email address", password: "Use at least 10 characters" });
    expect(fieldErrors({ code: "forbidden", message: "x" })).toEqual({});
  });
});
