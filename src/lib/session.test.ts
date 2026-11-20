import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { verifySessionToken } from "./session";

const secret = "s".repeat(48);

function token(overrides: { secret?: string; issuer?: string; audience?: string; exp?: string; claims?: Record<string, unknown> } = {}) {
  return new SignJWT({ cid: "c1", role: "ADMIN", email: "a@example.test", ...overrides.claims })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("u1")
    .setIssuer(overrides.issuer ?? "ballo-dash-api")
    .setAudience(overrides.audience ?? "ballo-dash")
    .setIssuedAt()
    .setExpirationTime(overrides.exp ?? "1h")
    .sign(new TextEncoder().encode(overrides.secret ?? secret));
}

describe("verifySessionToken", () => {
  it("accepts a token signed by the API", async () => {
    expect(await verifySessionToken(await token(), secret)).toEqual({ userId: "u1", companyId: "c1", role: "ADMIN", email: "a@example.test" });
  });

  it("rejects wrong secret, issuer, audience, expired and missing tokens", async () => {
    expect(await verifySessionToken(await token({ secret: "x".repeat(48) }), secret)).toBeNull();
    expect(await verifySessionToken(await token({ issuer: "someone-else" }), secret)).toBeNull();
    expect(await verifySessionToken(await token({ audience: "other-app" }), secret)).toBeNull();
    expect(await verifySessionToken(await token({ exp: "-1m" }), secret)).toBeNull();
    expect(await verifySessionToken(undefined, secret)).toBeNull();
    expect(await verifySessionToken(await token(), undefined)).toBeNull();
    expect(await verifySessionToken("not.a.jwt", secret)).toBeNull();
  });

  it("rejects tokens without a company", async () => {
    expect(await verifySessionToken(await token({ claims: { cid: undefined } }), secret)).toBeNull();
  });
});
