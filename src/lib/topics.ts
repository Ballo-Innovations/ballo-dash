/** Rising topics (L-04) as the API returns them. */
export interface TopicExample {
  id: string;
  text: string;
  sentiment: "NEG" | "NEU" | "POS";
  channel: string;
  author: string | null;
  occurredAt: string;
}

export interface Topic {
  id: string;
  name: string;
  terms: string[];
  score: number;
  mentionCount: number;
  dailyCounts: number[];
  firstSeen: string;
  lastSeen: string;
  examples?: TopicExample[];
}

/** Times the usual volume, for people: "3.2x usual" against the 14 day average. */
export function versusUsual(counts: number[]): string | null {
  if (counts.length < 2) return null;
  const base = counts.slice(0, -1);
  const mean = base.reduce((a, b) => a + b, 0) / base.length;
  const now = counts[counts.length - 1];
  if (mean === 0) return now > 0 ? "new" : null;
  const ratio = now / mean;
  return `${ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10}x usual`;
}
