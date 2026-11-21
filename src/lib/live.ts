/** Live wall list (L-02): newest first, no duplicates, at most MAX_CARDS. */
import type { Mention } from "./mentions";

export const MAX_CARDS = 200;

/** Adds mentions that arrived in insert order (oldest first) to a newest-first list. */
export function addMentions(
  list: Mention[],
  incoming: Mention[],
  max = MAX_CARDS,
): Mention[] {
  if (incoming.length === 0) return list;
  const seen = new Set(list.map((m) => m.id));
  const fresh: Mention[] = [];
  for (let i = incoming.length - 1; i >= 0; i--) {
    const m = incoming[i];
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    fresh.push(m);
  }
  if (fresh.length === 0) return list;
  return fresh.concat(list).slice(0, max);
}

export type StreamStatus = "connecting" | "live" | "reconnecting" | "closed";

export const STATUS_LABELS: Record<StreamStatus, string> = {
  connecting: "Connecting",
  live: "Live",
  reconnecting: "Reconnecting",
  closed: "Disconnected",
};
