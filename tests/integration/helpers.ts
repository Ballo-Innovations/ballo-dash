import { randomUUID } from "node:crypto";
import type { NextApiHandler } from "next";
import { vi } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "@/db/db";
import { companies, users } from "@/db/schema";
import type { Role } from "@/server/rbac";
import { mockReqRes } from "@/server/test-utils";

/** The session that next-auth's getServerSession returns in tests. Set with signInAs(). */
export const sessionState: { current: unknown } = { current: null };

vi.mock("next-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-auth")>();
  return { ...actual, getServerSession: async () => sessionState.current };
});

export interface TestTenant {
  companyId: string;
  userId: string;
  email: string;
}

export async function resetDatabase() {
  await db.execute(sql`TRUNCATE companies, users, integrations, social_profiles, social_media_data_cache, marketing_plans RESTART IDENTITY CASCADE`);
}

export async function createTenant(name: string, role: Role = "ADMIN"): Promise<TestTenant> {
  const companyId = randomUUID();
  const userId = randomUUID();
  const email = `${name.toLowerCase().replace(/\W+/g, "-")}-${userId.slice(0, 6)}@example.test`;
  await db.insert(companies).values({ id: companyId, name });
  await db.insert(users).values({
    id: userId,
    companyId,
    email,
    firstName: name,
    lastName: "Admin",
    passwordHash: "x",
    role: role === "ADMIN" || role === "MANAGER" || role === "ANALYST" ? role : "CLIENT",
  });
  return { companyId, userId, email };
}

export function signInAs(tenant: TestTenant | null, role: Role = "ADMIN") {
  sessionState.current = tenant
    ? { user: { id: tenant.userId, email: tenant.email, name: "Test", role, companyId: tenant.companyId }, expires: "2999-01-01" }
    : null;
}

export async function call(
  handler: NextApiHandler,
  init: { method?: string; query?: Record<string, string>; body?: unknown } = {}
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  const { req, res, out } = mockReqRes(init);
  await handler(req, res);
  return { status: out.statusCode, body: out.body, headers: out.headers };
}
