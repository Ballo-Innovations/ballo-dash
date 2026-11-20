import { useCallback, useRef, useState, type ReactElement } from "react";
import Head from "next/head";
import BreadcrumbItem from "@common/BreadcrumbItem";
import Layout from "@layout/index";
import { withFeature } from "@/components/FeatureGate";
import {
  DataTable,
  EmptyState,
  SourceChip,
  type Column,
} from "@/components/ui";
import { useSession } from "@/contexts/SessionContext";
import {
  IMPORT_SOURCES,
  IMPORT_TYPES,
  fileProblem,
  resultSummary,
  rowErrors,
  sendImport,
  type DateOrder,
  type ImportPreview,
  type ImportResult,
  type ImportType,
  type Mapping,
  type RowError,
} from "@/lib/imports";

/**
 * CSV import wizard (C-06): pick a tool, upload its export, check the column mapping and preview,
 * then import. Rows land as IMPORT data; importing the same file again adds nothing.
 */
const ALLOWED_ROLES = ["ADMIN", "MANAGER", "ANALYST"];
const SHOWN_ERRORS = 20;

function BadRows({ errors, total }: { errors: RowError[]; total: number }) {
  const [all, setAll] = useState(false);
  if (total === 0) return null;
  const shown = all ? errors : errors.slice(0, SHOWN_ERRORS);
  return (
    <div className="mt-3">
      <h6 className="text-danger">
        {total.toLocaleString("en")} bad {total === 1 ? "row" : "rows"}{" "}
        (skipped)
      </h6>
      <ul className="list-unstyled small mb-1" aria-label="Bad rows">
        {shown.map((e) => (
          <li key={e.line}>
            <strong>Line {e.line}:</strong> {e.message}
          </li>
        ))}
      </ul>
      {errors.length > SHOWN_ERRORS && (
        <button
          type="button"
          className="btn btn-link btn-sm p-0"
          onClick={() => setAll(!all)}
        >
          {all ? "Show fewer" : `Show ${errors.length - SHOWN_ERRORS} more`}
        </button>
      )}
      {total > errors.length && (
        <p className="small text-muted mb-0">
          Showing the first {errors.length} bad rows.
        </p>
      )}
    </div>
  );
}

type Item = Record<string, unknown> & { key: string };

function itemColumns(output: "metrics" | "mentions"): Column<Item>[] {
  if (output === "metrics")
    return [
      {
        key: "date",
        header: "Date",
        render: (r) => String(r.date),
        sortValue: (r) => String(r.date),
      },
      {
        key: "metric",
        header: "Metric",
        render: (r) => String(r.metric).replace(/_/g, " "),
        sortValue: (r) => String(r.metric),
      },
      {
        key: "value",
        header: "Value",
        render: (r) => Number(r.value).toLocaleString("en"),
        sortValue: (r) => Number(r.value),
        align: "end",
      },
    ];
  return [
    {
      key: "occurredAt",
      header: "Posted",
      render: (r) =>
        new Date(String(r.occurredAt)).toLocaleString("en-GB", {
          timeZone: "Africa/Lusaka",
          dateStyle: "medium",
          timeStyle: "short",
        }),
      sortValue: (r) => String(r.occurredAt),
    },
    {
      key: "text",
      header: "Post",
      render: (r) => <span className="text-wrap">{String(r.text)}</span>,
    },
    {
      key: "reach",
      header: "Impressions",
      render: (r) => Number(r.reach).toLocaleString("en"),
      sortValue: (r) => Number(r.reach),
      align: "end",
    },
    {
      key: "likes",
      header: "Likes",
      render: (r) => Number(r.likes).toLocaleString("en"),
      sortValue: (r) => Number(r.likes),
      align: "end",
    },
  ];
}

function ImportsPage() {
  const { data: session, status } = useSession();
  const [type, setType] = useState<ImportType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Mapping | undefined>();
  const [dateOrder, setDateOrder] = useState<DateOrder | undefined>();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<{
    message: string;
    rows: RowError[];
  } | null>(null);
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef(0);

  const runPreview = useCallback(
    async (t: ImportType, f: File, m?: Mapping, d?: DateOrder) => {
      const id = ++request.current;
      setBusy("preview");
      setError(null);
      const response = await sendImport<ImportPreview>(t, "preview", f, {
        mapping: m,
        dateOrder: d,
      });
      if (id !== request.current) return; // a newer preview replaced this one
      setBusy(null);
      if (response.ok) {
        setPreview(response.data);
        setMapping(response.data.mapping);
        setDateOrder(response.data.dateOrder);
      } else {
        setPreview(null);
        setError({
          message: response.error.message,
          rows: rowErrors(response.error),
        });
      }
    },
    [],
  );

  function reset(keepType = true) {
    request.current++;
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setMapping(undefined);
    setDateOrder(undefined);
    setBusy(null);
    if (!keepType) setType(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function chooseFile(chosen: File | undefined) {
    setResult(null);
    setPreview(null);
    setMapping(undefined);
    setDateOrder(undefined);
    if (!chosen) return setFile(null);
    const problem = fileProblem(chosen);
    if (problem) {
      setFile(null);
      setError({ message: problem, rows: [] });
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setError(null);
    setFile(chosen);
    if (type) void runPreview(type, chosen);
  }

  function changeMapping(key: string, header: string) {
    if (!type || !file) return;
    const next = { ...mapping, [key]: header || null };
    setMapping(next);
    void runPreview(type, file, next, dateOrder);
  }

  function changeDateOrder(order: DateOrder) {
    if (!type || !file) return;
    setDateOrder(order);
    void runPreview(type, file, mapping, order);
  }

  async function runImport() {
    if (!type || !file) return;
    setBusy("import");
    setError(null);
    const response = await sendImport<ImportResult>(type, "import", file, {
      mapping,
      dateOrder,
    });
    setBusy(null);
    if (response.ok) setResult(response.data);
    else
      setError({
        message: response.error.message,
        rows: rowErrors(response.error),
      });
  }

  if (status === "loading") return null;
  const role = session?.user.role?.toUpperCase() ?? "";
  if (!ALLOWED_ROLES.includes(role))
    return (
      <>
        <BreadcrumbItem mainTitle="Admin" subTitle="Data imports" />
        <div className="card">
          <EmptyState
            icon="ph-duotone ph-lock"
            title="You cannot import data"
            message="Imports are open to administrators, managers and analysts. Ask an administrator for access."
          />
        </div>
      </>
    );

  const source = type ? IMPORT_SOURCES[type] : null;
  const items: Item[] = (preview?.items ?? []).map((item, i) => ({
    ...item,
    key: String(item.externalId ?? `${item.date}-${item.metric}-${i}`),
  }));
  const hasSlashDates = preview?.sample.some((r) => {
    const col = preview.headers.indexOf(preview.mapping.date ?? "");
    return /^\d{1,2}[/.]\d{1,2}[/.]\d{4}/.test(r.cells[col] ?? "");
  });
  const canImport =
    !!preview &&
    preview.problems.length === 0 &&
    preview.rowsValid > 0 &&
    !busy &&
    !result;

  return (
    <>
      <Head>
        <title>Data imports | Ballo Dash</title>
      </Head>
      <BreadcrumbItem mainTitle="Admin" subTitle="Data imports" />

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">1. Choose what you are importing</h5>
        </div>
        <div className="card-body">
          <div className="row g-3" role="radiogroup" aria-label="Export type">
            {IMPORT_TYPES.map((t) => {
              const s = IMPORT_SOURCES[t];
              const selected = type === t;
              return (
                <div className="col-12 col-md-6 col-xl-3" key={t}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`btn btn-outline-secondary w-100 h-100 text-start p-3 position-relative ${selected ? "border-primary border-2" : ""}`}
                    onClick={() => {
                      if (t !== type) {
                        reset();
                        setType(t);
                      }
                    }}
                  >
                    {selected && (
                      <i
                        className="ph-fill ph-check-circle text-primary f-20 position-absolute top-0 end-0 m-2"
                        aria-hidden="true"
                      />
                    )}
                    <i
                      className={`${s.icon} f-24 d-block mb-2`}
                      aria-hidden="true"
                    />
                    <span className="d-block fw-semibold">{s.label}</span>
                    <span className="d-block small text-muted text-wrap">
                      {s.description}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {source && type && (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0">2. Upload the {source.label} export</h5>
            <a
              className="btn btn-link btn-sm p-0"
              href={source.sample}
              download
            >
              <i
                className="ph-duotone ph-download-simple me-1"
                aria-hidden="true"
              />
              Download a sample file
            </a>
          </div>
          <div className="card-body">
            <label htmlFor="import-file" className="form-label">
              CSV file, up to 10 MB
            </label>
            <input
              id="import-file"
              ref={fileInput}
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              className="form-control"
              onChange={(e) => chooseFile(e.target.files?.[0])}
              disabled={busy === "import"}
            />
            {busy === "preview" && (
              <p className="text-muted mt-3 mb-0" role="status">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
                Reading the file
              </p>
            )}
            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error.message}
                <BadRows errors={error.rows} total={error.rows.length} />
              </div>
            )}
          </div>
        </div>
      )}

      {preview && type && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">3. Check the columns and preview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {preview.fields.map((field) => (
                <div className="col-12 col-sm-6 col-xl-4" key={field.key}>
                  <label htmlFor={`map-${field.key}`} className="form-label">
                    {field.label}
                    {field.required && <span className="text-danger"> *</span>}
                  </label>
                  <select
                    id={`map-${field.key}`}
                    className="form-select"
                    value={preview.mapping[field.key] ?? ""}
                    onChange={(e) => changeMapping(field.key, e.target.value)}
                    disabled={!!busy || !!result}
                  >
                    <option value="">
                      {field.required ? "Choose a column" : "Not in this file"}
                    </option>
                    {preview.headers.filter(Boolean).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {hasSlashDates && (
                <div className="col-12 col-sm-6 col-xl-4">
                  <label htmlFor="date-order" className="form-label">
                    Dates are written
                  </label>
                  <select
                    id="date-order"
                    className="form-select"
                    value={preview.dateOrder}
                    onChange={(e) =>
                      changeDateOrder(e.target.value as DateOrder)
                    }
                    disabled={!!busy || !!result}
                  >
                    <option value="dmy">Day first (31/01/2026)</option>
                    <option value="mdy">Month first (01/31/2026)</option>
                  </select>
                </div>
              )}
            </div>

            {preview.problems.length > 0 ? (
              <div className="alert alert-warning mt-4 mb-0" role="alert">
                <p className="mb-1">Fix the column choices to continue:</p>
                <ul className="mb-0">
                  {preview.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-4 mb-3">
                  <span>
                    <strong>{preview.rowsValid.toLocaleString("en")}</strong> of{" "}
                    {preview.rowsIn.toLocaleString("en")} rows ready
                  </span>
                  <span>
                    <strong>
                      {(preview.itemCount ?? 0).toLocaleString("en")}
                    </strong>{" "}
                    {preview.output === "metrics" ? "daily values" : "posts"} to
                    write
                  </span>
                  <SourceChip kind="IMPORT" />
                </div>
                <DataTable
                  caption={`Preview of what will be imported${(preview.itemCount ?? 0) > items.length ? ` (first ${items.length})` : ""}`}
                  columns={itemColumns(preview.output)}
                  rows={items}
                  rowKey={(r) => r.key}
                  empty={{
                    title: "Nothing to import",
                    message:
                      "No row in this file could be read. See the bad rows below.",
                  }}
                />
                <BadRows errors={preview.errors} total={preview.errorCount} />
              </>
            )}
          </div>
          <div className="card-footer d-flex flex-wrap gap-2 align-items-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={runImport}
              disabled={!canImport}
            >
              {busy === "import" && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              {preview.errorCount > 0
                ? `Import ${preview.rowsValid.toLocaleString("en")} good rows`
                : "Import"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => reset()}
              disabled={busy === "import"}
            >
              {result ? "Import another file" : "Start over"}
            </button>
          </div>
        </div>
      )}

      {result && preview && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <i className="ph-duotone ph-check-circle me-2" aria-hidden="true" />
          {resultSummary(result, preview.output)}
        </div>
      )}
    </>
  );
}

const Gated = withFeature("adminConsole", ImportsPage);
const Page = Gated as typeof Gated & {
  getLayout?: (page: ReactElement) => ReactElement;
};
Page.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Page;
