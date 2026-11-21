import { describe, expect, it } from "vitest";
import { addMentions } from "./live";
import type { Mention } from "./mentions";

const m = (id: string) => ({ id }) as Mention;
const ids = (list: Mention[]) => list.map((x) => x.id);

describe("addMentions", () => {
  it("puts new arrivals first, newest at the top", () => {
    expect(ids(addMentions([m("b"), m("a")], [m("c"), m("d")]))).toEqual([
      "d",
      "c",
      "b",
      "a",
    ]);
  });
  it("skips mentions already on the wall, including repeats in one batch", () => {
    expect(
      ids(addMentions([m("b"), m("a")], [m("a"), m("c"), m("c")])),
    ).toEqual(["c", "b", "a"]);
  });
  it("keeps at most the cap, dropping the oldest", () => {
    const start = Array.from({ length: 200 }, (_, i) => m(`old${i}`));
    const next = addMentions(start, [m("n1"), m("n2")]);
    expect(next).toHaveLength(200);
    expect(ids(next).slice(0, 3)).toEqual(["n2", "n1", "old0"]);
    expect(ids(next)).not.toContain("old199");
  });
  it("returns the same list when nothing is new", () => {
    const list = [m("a")];
    expect(addMentions(list, [])).toBe(list);
    expect(addMentions(list, [m("a")])).toBe(list);
  });
});
