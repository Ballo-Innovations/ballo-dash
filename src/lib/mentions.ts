/**
 * Listening list (L-01): the page's own filters, kept in the URL next to the shared ones (F-11):
 *   ?sentiment=NEG,POS&channel=X&topic=outage&region=Lusaka&q=fibre&page=2
 */
import type { Range } from "./periods";

export type Sentiment = "NEG" | "NEU" | "POS";
export const SENTIMENTS: Sentiment[] = ["NEG", "NEU", "POS"];
export const PAGE_SIZE = 25;

export interface ListeningFilters {
  sentiment: Sentiment[];
  channel: string[];
  topic: string[];
  region: string[];
  q: string;
  page: number;
}

export const LISTENING_KEYS = [
  "sentiment",
  "channel",
  "topic",
  "region",
  "q",
  "page",
] as const;

export interface Mention {
  id: string;
  occurredAt: string;
  channel: string;
  sourceKind: "LIVE" | "IMPORT" | "SIMULATED" | "STUB";
  text: string;
  url: string | null;
  author: string | null;
  authorHandle: string | null;
  authorFollowers: number | null;
  verified: boolean;
  outlet: string | null;
  headline: string | null;
  sentiment: Sentiment;
  sentimentScore: number;
  confidence: number;
  reach: number;
  likes: number;
  shares: number;
  comments: number;
  region: string | null;
  city: string | null;
  topics: string[];
  brand: { id: string; name: string; isSelf: boolean };
}

export interface MentionsPage {
  total: number;
  page: number;
  pageSize: number;
  counts: Record<Sentiment, number>;
  mentions: Mention[];
}

export interface MentionOptions {
  channels: string[];
  regions: string[];
  topics: string[];
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}
function csv(
  v: string | string[] | undefined,
  valid: (s: string) => boolean,
): string[] {
  return Array.from(
    new Set(
      first(v)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && valid(s)),
    ),
  ).slice(0, 20);
}

export function parseListeningFilters(
  query: Record<string, string | string[] | undefined>,
): ListeningFilters {
  const page = Number.parseInt(first(query.page), 10);
  return {
    sentiment: csv(query.sentiment, (s) =>
      (SENTIMENTS as string[]).includes(s),
    ) as Sentiment[],
    channel: csv(query.channel, (s) => /^[A-Z_]{1,20}$/.test(s)),
    topic: csv(query.topic, (s) => s.length <= 80),
    region: csv(query.region, (s) => s.length <= 80),
    q: first(query.q).trim().slice(0, 200),
    page: Number.isFinite(page) && page >= 1 && page <= 10_000 ? page : 1,
  };
}

/** URL params for the page's filters, leaving out defaults. */
export function listeningQuery(f: ListeningFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.sentiment.length) out.sentiment = f.sentiment.join(",");
  if (f.channel.length) out.channel = f.channel.join(",");
  if (f.topic.length) out.topic = f.topic.join(",");
  if (f.region.length) out.region = f.region.join(",");
  if (f.q) out.q = f.q;
  if (f.page > 1) out.page = String(f.page);
  return out;
}

/** The API request for a page of mentions. */
export function mentionsUrl(
  range: Range,
  brand: string | undefined,
  f: ListeningFilters,
): string {
  const params = new URLSearchParams({
    from: range.start.toISOString(),
    to: range.end.toISOString(),
  });
  if (brand) params.set("brand", brand);
  for (const [k, v] of Object.entries(listeningQuery(f))) params.set(k, v);
  params.set("pageSize", String(PAGE_SIZE));
  return `/api/mentions?${params}`;
}

export const CHANNEL_LABELS: Record<string, string> = {
  X: "X",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  NEWS: "News",
  BLOG: "Blogs",
  FORUM: "Forums",
  REVIEW: "Reviews",
  SURVEY: "Surveys",
  WEB: "Web",
  EMAIL: "Email",
};

export const CHANNEL_ICONS: Record<string, string> = {
  X: "ph-twitter-logo",
  FACEBOOK: "ph-facebook-logo",
  INSTAGRAM: "ph-instagram-logo",
  LINKEDIN: "ph-linkedin-logo",
  TIKTOK: "ph-tiktok-logo",
  YOUTUBE: "ph-youtube-logo",
  NEWS: "ph-newspaper",
  BLOG: "ph-article",
  FORUM: "ph-chats",
  REVIEW: "ph-star",
  SURVEY: "ph-clipboard-text",
  WEB: "ph-globe",
  EMAIL: "ph-envelope-simple",
};

/** "12.4K" style numbers for reach and followers. */
export function compact(n: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
