import { describe, expect, it } from "vitest";
import { menuItems, visibleMenu } from "./MenuData";

const ids = (items: { id: string; submenu?: { id: string }[] }[]) =>
  items.map((item) =>
    item.submenu?.length
      ? `${item.id}[${item.submenu.map((s) => s.id).join(",")}]`
      : item.id,
  );
const allOn = () => true;
const allOff = () => false;

describe("sidebar", () => {
  it("lists every module in order for an admin with all flags on", () => {
    expect(
      ids(visibleMenu(menuItems, { role: "ADMIN", enabled: allOn })),
    ).toEqual([
      "dashboard",
      "listening",
      "media",
      "competitors",
      "campaigns",
      "paid-media",
      "feedback",
      "insights",
      "reports",
      "social[data,statistics]",
      "imports",
      "admin",
    ]);
  });

  it("shows only shipped pages while every flag is off", () => {
    expect(
      ids(visibleMenu(menuItems, { role: "ADMIN", enabled: allOff })),
    ).toEqual(["dashboard", "reports", "social[data,statistics]"]);
  });

  it("hides Admin from everyone but admins and Paid Media from roles without budgets", () => {
    const analyst = ids(
      visibleMenu(menuItems, { role: "ANALYST", enabled: allOn }),
    );
    expect(analyst).not.toContain("admin");
    expect(analyst).not.toContain("paid-media");
    expect(
      ids(visibleMenu(menuItems, { role: "MARKETER", enabled: allOn })),
    ).toContain("paid-media");
    expect(
      ids(visibleMenu(menuItems, { role: "readonly", enabled: allOn })),
    ).not.toContain("admin");
  });

  it("shows Data imports to admins, managers and analysts only", () => {
    for (const role of ["ADMIN", "MANAGER", "ANALYST"])
      expect(ids(visibleMenu(menuItems, { role, enabled: allOn }))).toContain(
        "imports",
      );
    for (const role of ["MARKETER", "COMMS", "READONLY"])
      expect(
        ids(visibleMenu(menuItems, { role, enabled: allOn })),
      ).not.toContain("imports");
  });

  it("treats a missing session role as the least access", () => {
    const items = ids(
      visibleMenu(menuItems, { role: undefined, enabled: allOn }),
    );
    expect(items).not.toContain("admin");
    expect(items).toContain("dashboard");
  });

  it("follows individual flags", () => {
    const items = ids(
      visibleMenu(menuItems, {
        role: "ADMIN",
        enabled: (name) => name === "listening",
      }),
    );
    expect(items).toEqual([
      "dashboard",
      "listening",
      "media",
      "reports",
      "social[data,statistics]",
    ]);
  });

  it("drops a group with no visible children and no page of its own", () => {
    const group = [
      {
        id: "g",
        label: "G",
        type: "HASHMENU" as const,
        submenu: [
          { id: "x", label: "X", link: "/x", roles: ["ADMIN" as const] },
        ],
      },
    ];
    expect(visibleMenu(group, { role: "COMMS", enabled: allOn })).toEqual([]);
  });
});
