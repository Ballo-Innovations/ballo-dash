/** Sentiment aggregates (I-07) for the Listening page bars. */
export interface Bucket {
  key: string;
  index: number | null;
  mentions: number;
}
export interface SentimentSummary {
  overall: { index: number | null; mentions: number };
  daily: Bucket[];
  byChannel: Bucket[];
  byRegion: Bucket[];
  byTopic: Bucket[];
  byAspect: Bucket[];
}

/** The index as people read it: -100 to +100, with a sign. */
export function score100(index: number | null): string {
  if (index === null) return "No data";
  const v = Math.round(index * 100);
  return v > 0 ? `+${v}` : String(v);
}

/** Bar geometry for a diverging bar around 0: left offset and width, in percent of the track. */
export function barGeometry(index: number | null): {
  left: number;
  width: number;
  tone: "NEG" | "NEU" | "POS";
} {
  const v = Math.max(-1, Math.min(1, index ?? 0));
  const width = Math.abs(v) * 50;
  return {
    left: v < 0 ? 50 - width : 50,
    width,
    tone: v < -0.15 ? "NEG" : v > 0.15 ? "POS" : "NEU",
  };
}
