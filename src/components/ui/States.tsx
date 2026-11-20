import type { CSSProperties, ReactNode } from "react";

/** Placeholder block while data loads (skeletons, not spinners). */
export function Skeleton({
  width = "100%",
  height = 16,
  className = "",
}: {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  className?: string;
}) {
  return (
    <span
      className={`ui-skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** Card-shaped skeleton with a few lines; announces loading to screen readers once. */
export function SkeletonCard({
  lines = 3,
  label = "Loading",
}: {
  lines?: number;
  label?: string;
}) {
  return (
    <div className="card" role="status" aria-live="polite">
      <div className="card-body d-flex flex-column gap-2">
        <span className="visually-hidden">{label}</span>
        <Skeleton width="40%" height={14} />
        <Skeleton width="60%" height={28} />
        {Array.from({ length: Math.max(0, lines - 2) }, (_, i) => (
          <Skeleton key={i} width={`${80 - i * 15}%`} height={12} />
        ))}
      </div>
    </div>
  );
}

/** Nothing to show yet. Every empty state offers a next step. */
export function EmptyState({
  icon = "ph-duotone ph-tray",
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-5 px-3">
      <i className={`${icon} f-40 text-muted`} aria-hidden="true"></i>
      <h5 className="mt-3 mb-1">{title}</h5>
      {message && <p className="text-muted mb-3">{message}</p>}
      {action}
    </div>
  );
}

/** Something failed. Says what happened and offers a retry when one makes sense. */
export function ErrorState({
  title = "This could not be loaded",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center py-5 px-3" role="alert">
      <i
        className="ph-duotone ph-warning-circle f-40 text-danger"
        aria-hidden="true"
      ></i>
      <h5 className="mt-3 mb-1">{title}</h5>
      {message && <p className="text-muted mb-3">{message}</p>}
      {onRetry && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
