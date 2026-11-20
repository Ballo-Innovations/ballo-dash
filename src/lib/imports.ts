/**
 * CSV import wizard client (C-06). The file goes to the API as the request body, gzipped when the
 * browser can (CSV shrinks 5 to 10 times), so large exports stay far below proxy body limits.
 */
import type { ApiProblem, ApiResult } from "./api-client";

export const IMPORT_TYPES = ["ga4", "meta", "mailchimp", "x"] as const;
export type ImportType = (typeof IMPORT_TYPES)[number];
export type DateOrder = "dmy" | "mdy";
export type Mapping = Record<string, string | null>;

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export const IMPORT_SOURCES: Record<
  ImportType,
  { label: string; icon: string; description: string; sample: string }
> = {
  ga4: {
    label: "Google Analytics 4",
    icon: "ph-duotone ph-chart-line-up",
    description:
      "Daily sessions, users, views and key events from a GA4 report export.",
    sample: "/samples/imports/ga4.csv",
  },
  meta: {
    label: "Meta Page insights",
    icon: "ph-duotone ph-facebook-logo",
    description:
      "Daily reach, impressions, engagement and followers from Meta Business Suite.",
    sample: "/samples/imports/meta.csv",
  },
  mailchimp: {
    label: "Mailchimp campaigns",
    icon: "ph-duotone ph-envelope-simple",
    description: "Emails sent, opens, clicks and bounces per send date.",
    sample: "/samples/imports/mailchimp.csv",
  },
  x: {
    label: "X post analytics",
    icon: "ph-duotone ph-twitter-logo",
    description: "Your posts with impressions, likes, reposts and replies.",
    sample: "/samples/imports/x.csv",
  },
};

export interface RowError {
  line: number;
  message: string;
}

export interface ImportPreview {
  type: ImportType;
  label: string;
  output: "metrics" | "mentions";
  fields: {
    key: string;
    label: string;
    kind: "date" | "number" | "text";
    required: boolean;
  }[];
  headers: string[];
  mapping: Mapping;
  dateOrder: DateOrder;
  problems: string[];
  sample: { line: number; cells: string[] }[];
  rowsIn: number;
  rowsValid: number;
  itemCount?: number;
  errorCount: number;
  errors: RowError[];
  items: Record<string, unknown>[];
}

export interface ImportResult {
  runId: string;
  rowsIn: number;
  rowsValid: number;
  itemsWritten: number;
  itemsNew: number;
  errorCount: number;
  errors: RowError[];
}

/** Why a file cannot be uploaded at all, or null when it can. */
export function fileProblem(file: {
  name: string;
  size: number;
}): string | null {
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_IMPORT_BYTES)
    return "This file is larger than 10 MB. Export a shorter date range.";
  if (!/\.(csv|txt|tsv)$/i.test(file.name)) return "Choose a CSV file (.csv).";
  return null;
}

export function importUrl(
  type: ImportType,
  step: "preview" | "import",
  options: { gzip: boolean; mapping?: Mapping; dateOrder?: DateOrder },
): string {
  const params = new URLSearchParams({ gzip: options.gzip ? "1" : "0" });
  if (options.mapping) params.set("mapping", JSON.stringify(options.mapping));
  if (options.dateOrder) params.set("dateOrder", options.dateOrder);
  return `/api/imports/${type}${step === "preview" ? "/preview" : ""}?${params}`;
}

async function gzip(file: Blob): Promise<Blob | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    return await new Response(
      file.stream().pipeThrough(new CompressionStream("gzip")),
    ).blob();
  } catch {
    return null;
  }
}

export async function sendImport<T>(
  type: ImportType,
  step: "preview" | "import",
  file: Blob,
  options: { mapping?: Mapping; dateOrder?: DateOrder } = {},
): Promise<ApiResult<T>> {
  const zipped = await gzip(file);
  try {
    const response = await fetch(
      importUrl(type, step, { ...options, gzip: zipped !== null }),
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": zipped ? "application/octet-stream" : "text/csv",
        },
        body: zipped ?? file,
      },
    );
    const payload = await response.json().catch(() => null);
    if (response.ok)
      return { ok: true, status: response.status, data: payload as T };
    const error = (payload as { error?: ApiProblem } | null)?.error;
    return {
      ok: false,
      status: response.status,
      error:
        error ??
        (response.status === 413
          ? {
              code: "payload_too_large",
              message: "The file is larger than 10 MB.",
            }
          : { code: "internal", message: "Something went wrong. Try again." }),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        code: "network",
        message:
          "Could not reach the server. Check your connection and try again.",
      },
    };
  }
}

/** Row errors from a refused import (they come back as the error's details). */
export function rowErrors(error: ApiProblem): RowError[] {
  if (!Array.isArray(error.details)) return [];
  return (error.details as Partial<RowError>[]).filter(
    (d): d is RowError =>
      typeof d?.line === "number" && typeof d?.message === "string",
  );
}

export function resultSummary(
  result: Pick<ImportResult, "itemsNew" | "itemsWritten" | "errorCount">,
  output: "metrics" | "mentions",
): string {
  const noun = output === "metrics" ? "daily values" : "posts";
  const skipped = result.errorCount
    ? ` ${result.errorCount} bad ${result.errorCount === 1 ? "row was" : "rows were"} skipped.`
    : "";
  if (result.itemsNew === 0)
    return `Nothing new: everything in this file was already imported${output === "metrics" ? " (values were refreshed)" : ""}.${skipped}`;
  const updated = result.itemsWritten - result.itemsNew;
  return `Imported ${result.itemsNew.toLocaleString("en")} new ${noun}${updated > 0 ? `, ${updated.toLocaleString("en")} already there` : ""}.${skipped}`;
}
