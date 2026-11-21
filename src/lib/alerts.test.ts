import { describe, expect, it } from "vitest";
import { alertSubject, canManageAlerts, describeChange } from "./alerts";

describe("alerts helpers", () => {
  it("knows who may change alerts", () => {
    expect(["ADMIN", "manager", "COMMS"].every((r) => canManageAlerts(r))).toBe(
      true,
    );
    expect(
      ["ANALYST", "MARKETER", "READONLY", undefined].some((r) =>
        canManageAlerts(r),
      ),
    ).toBe(false);
  });

  it("describes what an alert is about", () => {
    expect(
      alertSubject({
        aspect: "network reliability",
        region: "Copperbelt",
        topic: "#zednet",
      }),
    ).toBe("Network reliability in Copperbelt (#zednet)");
    expect(alertSubject({ aspect: null, region: null, topic: "outage" })).toBe(
      "outage",
    );
    expect(alertSubject({ aspect: null, region: "Lusaka", topic: null })).toBe(
      "Negative spike in Lusaka",
    );
  });

  it("turns audit entries into plain words", () => {
    const base = { at: "", before: null };
    expect(
      describeChange({
        ...base,
        action: "create",
        actor: null,
        after: { reason: "Negative mentions 6.2 SD above normal" },
      }),
    ).toBe("Alert raised: Negative mentions 6.2 SD above normal");
    expect(
      describeChange({
        ...base,
        action: "acknowledge",
        actor: "Mwila Banda",
        after: {},
      }),
    ).toBe("Mwila Banda acknowledged it");
    expect(
      describeChange(
        {
          ...base,
          action: "assign",
          actor: "Mwila Banda",
          after: { assigneeId: "u1" },
        },
        new Map([["u1", "Chanda Phiri"]]),
      ),
    ).toBe("Mwila Banda assigned it to Chanda Phiri");
    expect(
      describeChange({
        ...base,
        action: "assign",
        actor: "Mwila Banda",
        after: { assigneeId: null },
      }),
    ).toBe("Mwila Banda removed the assignee");
    expect(
      describeChange({
        ...base,
        action: "escalate",
        actor: null,
        after: { severity: "CRISIS", reason: "x" },
      }),
    ).toBe("Escalated to crisis: x");
  });
});
