/**
 * Integration records (H-03, H-04).
 *
 * Secrets (access token, refresh token, app secret) are write-only from the
 * browser's point of view: they are encrypted at rest by the schema column
 * type and never returned by any API. Responses carry has* flags instead.
 * On update, an empty or omitted secret means "keep the saved value".
 */
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/db";
import { integrations } from "@/db/schema";
import { conflict, notFound } from "./errors";

type IntegrationRow = typeof integrations.$inferSelect;

export const INTEGRATION_TYPES = [
  "FACEBOOK",
  "INSTAGRAM",
  "LINKEDIN",
  "X",
  "GOOGLE_ANALYTICS",
  "GOOGLE_SEARCH_CONSOLE",
  "TIKTOK",
  "YOUTUBE",
  "WEBSITE",
] as const;
export const INTEGRATION_STATUSES = ["CONNECTED", "DISCONNECTED", "PENDING", "EXPIRED", "ERROR"] as const;

export interface PublicIntegration extends Omit<IntegrationRow, "accessToken" | "refreshToken" | "appSecret"> {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasAppSecret: boolean;
  /** Always empty: kept so existing UI code that reads these fields keeps working. */
  accessToken: "";
  refreshToken: "";
  appSecret: "";
}

export function toPublicIntegration(row: IntegrationRow): PublicIntegration {
  const { accessToken, refreshToken, appSecret, ...rest } = row;
  return {
    ...rest,
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    hasAppSecret: Boolean(appSecret),
    accessToken: "",
    refreshToken: "",
    appSecret: "",
  };
}

const secret = z.string().trim().max(4096);
const optionalDate = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.null()])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === null ? null : new Date(value)));

export const createIntegrationSchema = z.object({
  type: z.enum(INTEGRATION_TYPES),
  status: z.enum(INTEGRATION_STATUSES).default("PENDING"),
  handle: z.string().trim().max(200).optional().nullable(),
  appId: z.string().trim().max(200).optional().nullable(),
  appSecret: secret.optional().nullable(),
  accessToken: secret.min(1, "Access token is required"),
  refreshToken: secret.optional().nullable(),
  expiresAt: optionalDate,
  accountId: z.string().trim().max(200).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateIntegrationSchema = z
  .object({
    status: z.enum(INTEGRATION_STATUSES).optional(),
    handle: z.string().trim().max(200).optional().nullable(),
    appId: z.string().trim().max(200).optional().nullable(),
    appSecret: secret.optional().nullable(),
    accessToken: secret.optional().nullable(),
    refreshToken: secret.optional().nullable(),
    expiresAt: optionalDate,
    accountId: z.string().trim().max(200).optional().nullable(),
  })
  .passthrough();

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;

/** Builds the column changes for an update; blank secrets are left unchanged. */
export function buildIntegrationUpdate(input: UpdateIntegrationInput): Partial<IntegrationRow> {
  const changes: Partial<IntegrationRow> = {};
  for (const key of ["accessToken", "refreshToken", "appSecret"] as const) {
    const value = input[key];
    if (typeof value === "string" && value.length > 0) changes[key] = value;
  }
  if (input.status !== undefined) changes.status = input.status;
  if (input.handle !== undefined) changes.handle = input.handle;
  if (input.appId !== undefined) changes.appId = input.appId;
  if (input.expiresAt !== undefined) changes.expiresAt = input.expiresAt;
  if (input.accountId !== undefined) changes.accountId = input.accountId;
  return changes;
}

export async function listIntegrations(companyId: string): Promise<PublicIntegration[]> {
  const rows = await db.select().from(integrations).where(eq(integrations.companyId, companyId));
  return rows.map(toPublicIntegration);
}

export async function getIntegration(companyId: string, id: string): Promise<PublicIntegration> {
  const [row] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.companyId, companyId)))
    .limit(1);
  if (!row) throw notFound("Integration");
  return toPublicIntegration(row);
}

export async function createIntegration(companyId: string, userId: string, input: CreateIntegrationInput): Promise<PublicIntegration> {
  const [row] = await db
    .insert(integrations)
    .values({
      companyId,
      type: input.type,
      status: input.status,
      handle: input.handle ?? null,
      appId: input.appId ?? null,
      appSecret: input.appSecret || null,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken || null,
      expiresAt: input.expiresAt ?? null,
      accountId: input.accountId ?? null,
      metadata: input.metadata ?? {},
      createdBy: userId,
      updatedBy: userId,
    })
    .onConflictDoNothing()
    .returning();
  if (!row) throw conflict(`A ${input.type} integration already exists for this company`);
  return toPublicIntegration(row);
}

export async function updateIntegration(companyId: string, userId: string, id: string, input: UpdateIntegrationInput): Promise<PublicIntegration> {
  const changes = buildIntegrationUpdate(input);
  const [row] = await db
    .update(integrations)
    .set({ ...changes, updatedAt: new Date(), updatedBy: userId })
    .where(and(eq(integrations.id, id), eq(integrations.companyId, companyId)))
    .returning();
  if (!row) throw notFound("Integration");
  return toPublicIntegration(row);
}

export async function deleteIntegration(companyId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.companyId, companyId)))
    .returning({ id: integrations.id });
  if (deleted.length === 0) throw notFound("Integration");
}
