import { SentimentPill, SourceChip } from "@/components/ui";
import {
  CHANNEL_ICONS,
  CHANNEL_LABELS,
  compact,
  type Mention,
} from "@/lib/mentions";
import { formatDateTime } from "@/lib/periods";

/** One mention in the Listening list (L-01). Clicking opens the drawer (L-03). */
export function MentionCard({
  mention,
  onOpen,
}: {
  mention: Mention;
  onOpen?: (m: Mention) => void;
}) {
  const who =
    mention.outlet ??
    mention.author ??
    (mention.authorHandle ? `@${mention.authorHandle}` : "Unknown author");
  const place = [mention.city, mention.region].filter(Boolean).join(", ");
  const open = onOpen ? () => onOpen(mention) : undefined;
  return (
    <article
      data-mention-id={mention.id}
      className={`card mb-2 listening-card${open ? " listening-card-clickable" : ""}`}
      aria-label={`${mention.sentiment === "NEG" ? "Negative" : mention.sentiment === "POS" ? "Positive" : "Neutral"} mention from ${who}`}
    >
      <div className="card-body p-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2 small">
          <i
            className={`ph-duotone ${CHANNEL_ICONS[mention.channel] ?? "ph-chat-circle"} f-18`}
            aria-hidden="true"
          />
          <span className="visually-hidden">
            {CHANNEL_LABELS[mention.channel] ?? mention.channel}
          </span>
          <strong className="text-truncate" style={{ maxWidth: "14rem" }}>
            {who}
          </strong>
          {mention.verified && (
            <i
              className="ph-duotone ph-seal-check text-primary"
              title="Verified"
              aria-label="Verified"
            />
          )}
          <span className="text-muted">
            {formatDateTime(mention.occurredAt)}
          </span>
          <span className="ms-auto d-flex align-items-center gap-2">
            <SentimentPill sentiment={mention.sentiment} />
            <SourceChip kind={mention.sourceKind} />
          </span>
        </div>
        {mention.headline && <h6 className="mb-1">{mention.headline}</h6>}
        {open ? (
          <button
            type="button"
            className="btn btn-link p-0 text-start text-body text-decoration-none listening-text"
            onClick={open}
          >
            {mention.headline && mention.text.startsWith(mention.headline)
              ? mention.text
                  .slice(mention.headline.length)
                  .replace(/^\.\s*/, "")
              : mention.text}
          </button>
        ) : (
          <p className="mb-0 listening-text">{mention.text}</p>
        )}
        <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
          <span>
            <i className="ph-duotone ph-tag me-1" aria-hidden="true" />
            {mention.brand.name}
            {!mention.brand.isSelf && " (competitor)"}
          </span>
          {place && (
            <span>
              <i className="ph-duotone ph-map-pin me-1" aria-hidden="true" />
              {place}
            </span>
          )}
          {mention.reach > 0 && (
            <span>
              <i className="ph-duotone ph-users me-1" aria-hidden="true" />
              {compact(mention.reach)} reach
            </span>
          )}
          {mention.topics.slice(0, 3).map((t) => (
            <span key={t}>#{t}</span>
          ))}
          {mention.url && (
            <a
              href={mention.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ms-auto"
            >
              Original{" "}
              <i
                className="ph-duotone ph-arrow-square-out"
                aria-hidden="true"
              />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
