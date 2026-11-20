/** Small JSON client for the API (same origin; Vercel forwards /api/*). */

export interface ApiProblem {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; error: ApiProblem };

export async function postJson<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok) return { ok: true, status: response.status, data: payload as T };
    const error = (payload as { error?: ApiProblem } | null)?.error;
    return { ok: false, status: response.status, error: error ?? { code: "internal", message: "Something went wrong. Try again." } };
  } catch {
    return { ok: false, status: 0, error: { code: "network", message: "Could not reach the server. Check your connection and try again." } };
  }
}

export async function getJson<T = unknown>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, { credentials: "same-origin" });
    const payload = await response.json().catch(() => null);
    if (response.ok) return { ok: true, status: response.status, data: payload as T };
    const error = (payload as { error?: ApiProblem } | null)?.error;
    return { ok: false, status: response.status, error: error ?? { code: "internal", message: "Something went wrong. Try again." } };
  } catch {
    return { ok: false, status: 0, error: { code: "network", message: "Could not reach the server. Check your connection and try again." } };
  }
}

/** Turns a 422 response's details into { fieldName: message } (first message per field). */
export function fieldErrors(error: ApiProblem): Record<string, string> {
  const out: Record<string, string> = {};
  if (error.code !== "validation_failed" || !Array.isArray(error.details)) return out;
  for (const issue of error.details as { path?: string; message?: string }[]) {
    if (issue.path && issue.message && !out[issue.path]) out[issue.path] = issue.message;
  }
  return out;
}
