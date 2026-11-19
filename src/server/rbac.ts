/**
 * Roles and capabilities (F-02). One matrix, used by API routes, pages and nav.
 * Source: docs/scope (kit 02-architecture/05-security-rbac-audit.md).
 */

export const ROLES = ["ADMIN", "MANAGER", "ANALYST", "MARKETER", "COMMS", "READONLY"] as const;
export type Role = (typeof ROLES)[number];

export const CAPABILITIES = [
  "dashboards.view",
  "alerts.manage",
  "campaigns.edit",
  "surveys.create",
  "reports.generate",
  "integrations.manage",
  "company.edit",
  "admin.access",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

const MATRIX: Record<Capability, readonly Role[]> = {
  "dashboards.view": ROLES,
  "alerts.manage": ["ADMIN", "MANAGER", "COMMS"],
  "campaigns.edit": ["ADMIN", "MANAGER", "MARKETER"],
  "surveys.create": ["ADMIN", "MANAGER", "ANALYST", "MARKETER"],
  "reports.generate": ["ADMIN", "MANAGER", "ANALYST"],
  "integrations.manage": ["ADMIN", "MANAGER"],
  "company.edit": ["ADMIN", "MANAGER"],
  "admin.access": ["ADMIN"],
};

/** Maps stored role strings (including the legacy CLIENT role) to a Role. Unknown values get the least access. */
export function normaliseRole(value: unknown): Role {
  if (typeof value !== "string") return "READONLY";
  const upper = value.toUpperCase();
  if ((ROLES as readonly string[]).includes(upper)) return upper as Role;
  return "READONLY";
}

export function can(role: unknown, capability: Capability): boolean {
  return MATRIX[capability].includes(normaliseRole(role));
}

export function rolesWith(capability: Capability): readonly Role[] {
  return MATRIX[capability];
}
