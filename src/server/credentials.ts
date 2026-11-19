/**
 * Email and password sign-in (H-13).
 * - Rate limited per IP and per email address.
 * - Unknown emails still run a bcrypt comparison so timing does not reveal
 *   which addresses have accounts.
 * - Inactive users cannot sign in.
 */
import bcrypt from "bcryptjs";
import { checkRateLimit, type RateLimitRule } from "./rate-limit";
import { logger } from "@/lib/logger";

const log = logger.child("auth");

export const LOGIN_LIMITS: { ip: RateLimitRule; email: RateLimitRule } = {
  ip: { name: "login-ip", limit: 30, windowSeconds: 15 * 60 },
  email: { name: "login-email", limit: 10, windowSeconds: 15 * 60 },
};

// bcrypt hash of a random string; compared against when the user does not exist.
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5x8E.0bYl9iV1lQ1sK3o3Z0fYv1nZ8K";

export interface CredentialUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  isActive: boolean;
  passwordHash: string;
}

export interface CredentialDeps {
  findUserByEmail: (email: string) => Promise<CredentialUser | undefined>;
  rateLimit?: typeof checkRateLimit;
}

export class LoginRateLimitedError extends Error {
  constructor() {
    super("Too many sign-in attempts. Wait a few minutes and try again.");
    this.name = "LoginRateLimitedError";
  }
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function verifyCredentials(
  input: { email?: string; password?: string; ip: string },
  deps: CredentialDeps
): Promise<{ id: string; name: string; email: string; role: string; companyId: string } | null> {
  const email = normaliseEmail(input.email ?? "");
  const password = input.password ?? "";
  if (!email || !password || password.length > 200) return null;

  const limit = deps.rateLimit ?? checkRateLimit;
  const [byIp, byEmail] = await Promise.all([limit(LOGIN_LIMITS.ip, input.ip), limit(LOGIN_LIMITS.email, email)]);
  if (!byIp.allowed || !byEmail.allowed) {
    log.warn("sign-in rate limited", { ip: input.ip });
    throw new LoginRateLimitedError();
  }

  const user = await deps.findUserByEmail(email);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.isActive) return null;

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };
}
