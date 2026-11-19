import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it } from "vitest";
import { LoginRateLimitedError, verifyCredentials, type CredentialUser } from "./credentials";
import { MemoryRateLimitStore, checkRateLimit } from "./rate-limit";

let user: CredentialUser;

beforeAll(async () => {
  user = {
    id: "u1",
    email: "natasha@example.test",
    firstName: "Natasha",
    lastName: "Banda",
    role: "MANAGER",
    companyId: "c1",
    isActive: true,
    passwordHash: await bcrypt.hash("correct horse battery", 4),
  };
});

function deps(found: CredentialUser | undefined = user) {
  const store = new MemoryRateLimitStore();
  return {
    findUserByEmail: async (email: string) => (found && email === found.email ? found : undefined),
    rateLimit: (rule: Parameters<typeof checkRateLimit>[0], id: string) => checkRateLimit(rule, id, store),
  };
}

describe("verifyCredentials", () => {
  it("signs in with the right password, matching email case-insensitively", async () => {
    const result = await verifyCredentials({ email: "  Natasha@Example.test ", password: "correct horse battery", ip: "1.1.1.1" }, deps());
    expect(result).toEqual({ id: "u1", name: "Natasha Banda", email: user.email, role: "MANAGER", companyId: "c1" });
  });

  it("rejects a wrong password, an unknown email and an inactive user", async () => {
    expect(await verifyCredentials({ email: user.email, password: "nope", ip: "1.1.1.1" }, deps())).toBeNull();
    expect(await verifyCredentials({ email: "ghost@example.test", password: "x", ip: "1.1.1.1" }, deps())).toBeNull();
    expect(await verifyCredentials({ email: user.email, password: "correct horse battery", ip: "1.1.1.1" }, deps({ ...user, isActive: false }))).toBeNull();
  });

  it("rejects empty and oversized input without a lookup", async () => {
    expect(await verifyCredentials({ email: "", password: "x", ip: "1" }, deps())).toBeNull();
    expect(await verifyCredentials({ email: user.email, password: "x".repeat(201), ip: "1" }, deps())).toBeNull();
  });

  it("locks an email after 10 attempts in the window, even from different IPs", async () => {
    const d = deps();
    for (let i = 0; i < 10; i++) {
      await verifyCredentials({ email: user.email, password: "wrong", ip: `10.0.0.${i}` }, d);
    }
    await expect(verifyCredentials({ email: user.email, password: "correct horse battery", ip: "10.0.0.99" }, d)).rejects.toBeInstanceOf(
      LoginRateLimitedError
    );
  });
});
