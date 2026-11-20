import { describe, expect, it } from "vitest";
import { ROLES, ROLE_LABELS, roleLabel } from "./roles";

describe("roleLabel", () => {
  it.each(ROLES.map((role) => [role, ROLE_LABELS[role]]))("labels %s as %s", (role, label) => {
    expect(roleLabel(role)).toBe(label);
  });

  it("reads lower-case roles", () => {
    expect(roleLabel("comms")).toBe("Communications");
  });

  it("treats the legacy CLIENT role and unknown values as view only", () => {
    expect(roleLabel("CLIENT")).toBe("View only");
    expect(roleLabel(undefined)).toBe("View only");
  });
});
