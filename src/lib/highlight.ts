/**
 * Where the matched sentiment terms (I-01) appear in a mention's text, for highlighting in the
 * drawer (L-03). A label may carry a negation or intensifier in front ("not reliable", "very slow");
 * when the whole label is not in the text, its last word is highlighted instead.
 */
export interface Segment {
  text: string;
  match: boolean;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pattern(term: string): RegExp {
  const words = term.split(/\s+/).map(escape).join("[\\s\\p{P}]+");
  // Whole words for letters; emoji match as they are.
  return new RegExp("^[\\p{L}\\p{N}]", "u").test(term)
    ? new RegExp(`(?<![\\p{L}\\p{N}])${words}(?![\\p{L}\\p{N}])`, "giu")
    : new RegExp(words, "giu");
}

export function highlight(text: string, terms: string[]): Segment[] {
  const ranges: [number, number][] = [];
  for (const term of terms) {
    const candidates = [term, term.split(/\s+/).slice(-1)[0]];
    for (const candidate of candidates) {
      let found = false;
      const re = pattern(candidate);
      for (let m = re.exec(text); m; m = re.exec(text)) {
        if (m[0].length === 0) {
          re.lastIndex++;
          continue;
        }
        ranges.push([m.index, m.index + m[0].length]);
        found = true;
      }
      if (found) break;
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const segments: Segment[] = [];
  let at = 0;
  for (const [start, end] of merged) {
    if (start > at)
      segments.push({ text: text.slice(at, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    at = end;
  }
  if (at < text.length) segments.push({ text: text.slice(at), match: false });
  return segments;
}
