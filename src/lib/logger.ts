/**
 * Levelled logger with redaction (H-06).
 *
 * - Server: one JSON line per entry, level from LOG_LEVEL (default "info";
 *   "debug" in development).
 * - Browser: only warn and error in production.
 * - Values under sensitive keys (tokens, secrets, passwords, cookies,
 *   authorization) are replaced, and token-looking query parameters and
 *   e-mail addresses inside strings are masked.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SENSITIVE_KEY = /token|secret|password|passwd|authorization|cookie|api[-_]?key|signature|session/i;
const TOKEN_PARAM = /([?&](?:access_token|refresh_token|client_secret|token|code|key)=)[^&\s"']+/gi;
const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const REDACTED = "[REDACTED]";
const MAX_DEPTH = 6;

/** Returns a copy of `value` that is safe to write to logs. */
export function redact(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") {
    return value.replace(TOKEN_PARAM, `$1${REDACTED}`).replace(EMAIL, "$1***@$2");
  }
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Error) {
    return { name: value.name, message: redact(value.message, depth + 1, seen) };
  }
  if (value instanceof Date) return value.toISOString();
  if (seen.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return "[Truncated]";
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1, seen));

  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY.test(key) ? REDACTED : redact(inner, depth + 1, seen);
  }
  return out;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function threshold(): number {
  if (isBrowser()) {
    return process.env.NODE_ENV === "production" ? LEVELS.warn : LEVELS.debug;
  }
  const configured = process.env.LOG_LEVEL as LogLevel | undefined;
  if (configured && configured in LEVELS) return LEVELS[configured];
  return process.env.NODE_ENV === "production" ? LEVELS.info : LEVELS.debug;
}

type Sink = (level: LogLevel, line: string, payload: Record<string, unknown>) => void;

const defaultSink: Sink = (level, line, payload) => {
  const write = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  if (isBrowser()) write(payload.msg, payload.context ?? "");
  else write(line);
};

let sink: Sink = defaultSink;

/** Test hook: replace where log lines go. Returns a function that restores the default. */
export function setLogSink(next: Sink): () => void {
  sink = next;
  return () => {
    sink = defaultSink;
  };
}

function write(level: LogLevel, scope: string | undefined, first: unknown, rest: unknown[]) {
  if (LEVELS[level] < threshold()) return;
  const msg = typeof first === "string" ? first : "";
  const extras = typeof first === "string" ? rest : [first, ...rest];
  const context = extras.length === 0 ? undefined : extras.length === 1 ? extras[0] : extras;
  const payload: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    ...(scope ? { scope } : {}),
    msg: redact(msg),
    ...(context === undefined ? {} : { context: redact(context) }),
  };
  sink(level, JSON.stringify(payload), payload);
}

/**
 * `msg` should be a short constant string; put variable data in `context`.
 * Extra arguments are accepted (and logged as an array) for console-style calls.
 */
export interface Logger {
  debug(msg: unknown, ...context: unknown[]): void;
  info(msg: unknown, ...context: unknown[]): void;
  warn(msg: unknown, ...context: unknown[]): void;
  error(msg: unknown, ...context: unknown[]): void;
  child(scope: string): Logger;
}

function make(scope?: string): Logger {
  return {
    debug: (msg, ...context) => write("debug", scope, msg, context),
    info: (msg, ...context) => write("info", scope, msg, context),
    warn: (msg, ...context) => write("warn", scope, msg, context),
    error: (msg, ...context) => write("error", scope, msg, context),
    child: (name) => make(scope ? `${scope}:${name}` : name),
  };
}

export const logger = make();
