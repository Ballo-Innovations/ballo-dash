import { describe, expect, it } from "vitest";
import { EnvError, parseServerEnv } from "./env";

const KEY = Buffer.alloc(32, 7).toString("base64");

const valid = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/ballo_dash",
  NEXTAUTH_SECRET: "x".repeat(32),
  TOKEN_ENCRYPTION_KEY: KEY,
};

describe("parseServerEnv", () => {
  it("accepts a minimal development environment and applies defaults", () => {
    const env = parseServerEnv(valid);
    expect(env.APP_ENV).toBe("development");
    expect(env.DATABASE_SSL).toBe("disable");
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("treats empty strings as unset for optional values", () => {
    const env = parseServerEnv({ ...valid, ANTHROPIC_API_KEY: "", NEXTAUTH_URL: "" });
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(env.NEXTAUTH_URL).toBeUndefined();
  });

  it("lists every problem in one error", () => {
    try {
      parseServerEnv({ NEXTAUTH_SECRET: "short", TOKEN_ENCRYPTION_KEY: "abc" });
      throw new Error("expected failure");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvError);
      const issues = (error as EnvError).issues.join("\n");
      expect(issues).toContain("DATABASE_URL");
      expect(issues).toContain("NEXTAUTH_SECRET: must be at least 32 characters");
      expect(issues).toContain("TOKEN_ENCRYPTION_KEY: must be 32 bytes");
    }
  });

  it("requires Redis and database TLS in staging and production", () => {
    expect(() => parseServerEnv({ ...valid, APP_ENV: "production" })).toThrow(/UPSTASH_REDIS_REST_URL[\s\S]*DATABASE_SSL/);
    expect(() =>
      parseServerEnv({
        ...valid,
        APP_ENV: "production",
        DATABASE_SSL: "require",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "t",
      })
    ).not.toThrow();
  });
});
