/**
 * User roles (F-02). The API (ballo-dash-api src/common/rbac.ts) decides what each role may do;
 * the web app only needs their names.
 */
export const ROLES = ["ADMIN", "MANAGER", "ANALYST", "MARKETER", "COMMS", "READONLY"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  ANALYST: "Analyst",
  MARKETER: "Marketer",
  COMMS: "Communications",
  READONLY: "View only",
};

/** Label for a stored role. Unknown or legacy values (CLIENT) read as view only, matching the API. */
export function roleLabel(role: unknown): string {
  const upper = typeof role === "string" ? role.toUpperCase() : "";
  return (ROLES as readonly string[]).includes(upper) ? ROLE_LABELS[upper as Role] : ROLE_LABELS.READONLY;
}
