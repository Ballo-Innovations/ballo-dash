import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, isEncrypted, keyRingFromEnv, needsReencryption } from "./secret-box";

const keyA = Buffer.alloc(32, 1);
const keyB = Buffer.alloc(32, 2);

describe("secret box", () => {
  it("round-trips and never stores plaintext", () => {
    const ring = { current: keyA };
    const token = "EAAB-very-secret-token";
    const stored = encryptSecret(token, ring);
    expect(isEncrypted(stored)).toBe(true);
    expect(stored).not.toContain(token);
    expect(decryptSecret(stored, ring)).toBe(token);
  });

  it("uses a fresh IV each time", () => {
    const ring = { current: keyA };
    expect(encryptSecret("same", ring)).not.toBe(encryptSecret("same", ring));
  });

  it("does not double-encrypt", () => {
    const ring = { current: keyA };
    const once = encryptSecret("x", ring);
    expect(encryptSecret(once, ring)).toBe(once);
  });

  it("returns legacy plaintext unchanged so rows can be migrated", () => {
    expect(decryptSecret("plain-legacy-token", { current: keyA })).toBe("plain-legacy-token");
    expect(needsReencryption("plain-legacy-token", { current: keyA })).toBe(true);
  });

  it("detects tampering", () => {
    const ring = { current: keyA };
    const stored = encryptSecret("token", ring);
    const parts = stored.split(":");
    const data = Buffer.from(parts[5], "base64url");
    data[0] ^= 0xff;
    parts[5] = data.toString("base64url");
    expect(() => decryptSecret(parts.join(":"), ring)).toThrow();
  });

  it("supports key rotation through the previous key", () => {
    const oldValue = encryptSecret("token", { current: keyA });
    const rotated = { current: keyB, previous: keyA };
    expect(decryptSecret(oldValue, rotated)).toBe("token");
    expect(needsReencryption(oldValue, rotated)).toBe(true);
    expect(needsReencryption(encryptSecret("token", rotated), rotated)).toBe(false);
    expect(() => decryptSecret(oldValue, { current: keyB })).toThrow(/No key available/);
  });

  it("reads keys from the environment and rejects bad lengths", () => {
    expect(keyRingFromEnv({ TOKEN_ENCRYPTION_KEY: keyA.toString("base64") }).current.equals(keyA)).toBe(true);
    expect(() => keyRingFromEnv({})).toThrow(/not set/);
    expect(() => keyRingFromEnv({ TOKEN_ENCRYPTION_KEY: Buffer.alloc(16).toString("base64") })).toThrow(/32 bytes/);
  });
});
