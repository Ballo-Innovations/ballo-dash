/** Error codes returned to API clients in `{ error: { code, message, details? } }`. */
export type ApiErrorCode =
  | "bad_request"
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "method_not_allowed"
  | "conflict"
  | "payload_too_large"
  | "rate_limited"
  | "service_unavailable"
  | "internal";

const STATUS: Record<ApiErrorCode, number> = {
  bad_request: 400,
  validation_failed: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  method_not_allowed: 405,
  conflict: 409,
  payload_too_large: 413,
  rate_limited: 429,
  service_unavailable: 503,
  internal: 500,
};

/** An error that is safe to show to the client. Anything else becomes a generic 500. */
export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
    readonly headers?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = STATUS[code];
  }
}

export const notFound = (what = "Resource") => new ApiError("not_found", `${what} not found`);
export const forbidden = (message = "You do not have permission to do this") => new ApiError("forbidden", message);
export const badRequest = (message: string, details?: unknown) => new ApiError("bad_request", message, details);
export const conflict = (message: string) => new ApiError("conflict", message);
export const serviceUnavailable = (message: string) => new ApiError("service_unavailable", message);
