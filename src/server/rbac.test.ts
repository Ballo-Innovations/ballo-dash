import { describe, expect, it } from "vitest";
import { CAPABILITIES, ROLES, can, normaliseRole, type Capability, type Role } from "./rbac";

// Expected matrix from the kit's security spec, written out independently of the implementation.
const expected: Record<Role, Capability[]> = {
  ADMIN: [...CAPABILITIES],
  MANAGER: ["dashboards.view", "alerts.manage", "campaigns.edit", "surveys.create", "reports.generate", "integrations.manage", "company.edit"],
  ANALYST: ["dashboards.view", "surveys.create", "reports.generate"],
  MARKETER: ["dashboards.view", "campaigns.edit", "surveys.create"],
  COMMS: ["dashboards.view", "alerts.manage"],
  READONLY: ["dashboards.view"],
};

describe("rbac matrix", () => {
  for (const role of ROLES) {
    for (const capability of CAPABILITIES) {
      const allowed = expected[role].includes(capability);
      it(`${role} ${allowed ? "can" : "cannot"} ${capability}`, () => {
        expect(can(role, capability)).toBe(allowed);
      });
    }
  }
});

describe("normaliseRole", () => {
  it("accepts known roles case-insensitively", () => {
    expect(normaliseRole("admin")).toBe("ADMIN");
    expect(normaliseRole("COMMS")).toBe("COMMS");
  });

  it("maps the legacy CLIENT role and unknown values to READONLY", () => {
    expect(normaliseRole("CLIENT")).toBe("READONLY");
    expect(normaliseRole("SUPERUSER")).toBe("READONLY");
    expect(normaliseRole(undefined)).toBe("READONLY");
    expect(can("CLIENT", "integrations.manage")).toBe(false);
  });
});
