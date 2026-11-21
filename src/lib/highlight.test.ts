import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

const marked = (text: string, terms: string[]) =>
  highlight(text, terms)
    .map((s) => (s.match ? `[${s.text}]` : s.text))
    .join("");

describe("highlight", () => {
  it("marks whole words in any case, every time they appear", () => {
    expect(marked("Fibre DOWN again, down for hours 😤", ["down", "😤"])).toBe(
      "Fibre [DOWN] again, [down] for hours [😤]",
    );
    expect(marked("downtown is fine", ["down"])).toBe("downtown is fine");
  });

  it("marks phrases, and falls back to the last word of a negated or boosted label", () => {
    expect(marked("No signal in Kabwata", ["no signal"])).toBe(
      "[No signal] in Kabwata",
    );
    expect(marked("It is not reliable", ["not reliable"])).toBe(
      "It is [not reliable]",
    );
    expect(marked("Not very fast, honestly", ["not very fast"])).toBe(
      "[Not very fast], honestly",
    );
    expect(marked("never been happy", ["never happy"])).toBe(
      "never been [happy]",
    );
  });

  it("merges overlaps and copes with nothing to mark", () => {
    expect(marked("so slow", ["so slow", "slow"])).toBe("[so slow]");
    expect(marked("plain text", [])).toBe("plain text");
    expect(marked("", ["x"])).toBe("");
    expect(marked("price (K150) up", ["(k150)"])).toBe("price [(K150)] up");
  });
});
