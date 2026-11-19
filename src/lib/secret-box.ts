/**
 * Authenticated encryption for secrets stored in the database (H-04).
 *
 * Format: "enc:v1:<keyId>:<iv>:<tag>:<ciphertext>" (base64url parts).
 * - AES-256-GCM with a random 96-bit IV per value.
 * - keyId is the first 8 hex chars of SHA-256(key), so rotation works:
 *   TOKEN_ENCRYPTION_KEY encrypts, TOKEN_ENCRYPTION_KEY_PREVIOUS can still decrypt.
 * - Values without the prefix are legacy plaintext and are returned unchanged,
 *   which lets existing rows be migrated in place (scripts/encrypt-integration-secrets.ts).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

export interface KeyRing {
  current: Buffer;
  previous?: Buffer;
}

function decodeKey(value: string | undefined, name: string): Buffer | undefined {
  if (!value) return undefined;
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error(`${name} must be 32 bytes, base64 encoded`);
  return key;
}

export function keyRingFromEnv(env: Record<string, string | undefined> = process.env): KeyRing {
  const current = decodeKey(env.TOKEN_ENCRYPTION_KEY, "TOKEN_ENCRYPTION_KEY");
  if (!current) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  return { current, previous: decodeKey(env.TOKEN_ENCRYPTION_KEY_PREVIOUS, "TOKEN_ENCRYPTION_KEY_PREVIOUS") };
}

export function keyId(key: Buffer): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 8);
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function encryptSecret(plaintext: string, ring: KeyRing = keyRingFromEnv()): string {
  if (isEncrypted(plaintext)) return plaintext; // never double-encrypt
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ring.current, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${keyId(ring.current)}:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptSecret(value: string, ring: KeyRing = keyRingFromEnv()): string {
  if (!isEncrypted(value)) return value; // legacy plaintext row
  const parts = value.slice(PREFIX.length).split(":");
  if (parts.length !== 4) throw new Error("Malformed encrypted value");
  const [id, ivPart, tagPart, dataPart] = parts;
  const key = [ring.current, ring.previous].find((candidate) => candidate && keyId(candidate) === id);
  if (!key) throw new Error("No key available for encrypted value (rotated without TOKEN_ENCRYPTION_KEY_PREVIOUS?)");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]).toString("utf8");
}

/** True when the value is encrypted with a key other than the current one (needs re-encryption). */
export function needsReencryption(value: string, ring: KeyRing = keyRingFromEnv()): boolean {
  if (!isEncrypted(value)) return true;
  return value.slice(PREFIX.length).split(":")[0] !== keyId(ring.current);
}
