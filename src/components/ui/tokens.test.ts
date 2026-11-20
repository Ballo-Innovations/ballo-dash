/** F-12: every semantic text/tint pair in _semantic-tokens.scss meets WCAG AA (4.5:1) in both themes. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scss = readFileSync(
  join(process.cwd(), "src/assets/scss/components/_semantic-tokens.scss"),
  "utf8",
);

function block(selectorStart: string): Record<string, string> {
  const start = scss.indexOf(selectorStart);
  const open = scss.indexOf("{", start);
  const close = scss.indexOf("}", open);
  const vars: Record<string, string> = {};
  const pattern = /--([a-z-]+):\s*(#[0-9a-f]{6});/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(scss.slice(open, close))))
    vars[match[1]] = match[2];
  return vars;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const themes = {
  light: block(":root,"),
  dark: block('[data-pc-theme="dark"]'),
};

describe("semantic colour tokens", () => {
  for (const [theme, vars] of Object.entries(themes)) {
    const pairs = Object.keys(vars)
      .filter((name) => name.endsWith("-fg"))
      .map((name) => name.slice(0, -3));

    it(`${theme} defines all 15 states (3 sentiment, 3 severity, 5 billing, 4 source)`, () => {
      expect(pairs).toHaveLength(15);
    });

    for (const pair of pairs) {
      it(`${theme} ${pair} text on its tint is at least 4.5:1`, () => {
        expect(vars[`${pair}-bg`], `${pair}-bg missing`).toBeDefined();
        expect(
          contrast(vars[`${pair}-fg`], vars[`${pair}-bg`]),
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("both themes define the same tokens", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(
      Object.keys(themes.light).sort(),
    );
  });
});
