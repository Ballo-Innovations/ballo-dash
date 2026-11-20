import { useMemo, useState, type ReactNode } from "react";
import { EmptyState, Skeleton } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Value used for sorting; omit to make the column unsortable. */
  sortValue?: (row: T) => string | number | null;
  align?: "start" | "end";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  loading?: boolean;
  empty?: { title: string; message?: string; action?: ReactNode };
  onRowClick?: (row: T) => void;
  initialSort?: { key: string; direction: "asc" | "desc" };
}

/** Sortable table on the template's table styles (F-12). Rows open with click or Enter when onRowClick is set. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  empty,
  onRowClick,
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!column?.sortValue || !sort) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = column.sortValue!(a);
      const vb = column.sortValue!(b);
      if (va === vb) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va < vb ? -1 : 1) * factor;
    });
  }, [columns, rows, sort]);

  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        title={empty?.title ?? "Nothing here yet"}
        message={empty?.message}
        action={empty?.action}
      />
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              const ariaSort = active
                ? sort!.direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none";
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align === "end" ? "text-end" : undefined}
                  aria-sort={column.sortValue ? ariaSort : undefined}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className="btn btn-link p-0 text-reset fw-semibold text-decoration-none"
                      onClick={() =>
                        setSort({
                          key: column.key,
                          direction:
                            active && sort!.direction === "asc"
                              ? "desc"
                              : "asc",
                        })
                      }
                    >
                      {column.header}
                      <i
                        className={`ph ms-1 ${active ? (sort!.direction === "asc" ? "ph-caret-up" : "ph-caret-down") : "ph-caret-up-down"}`}
                        aria-hidden="true"
                      ></i>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={`skeleton-${i}`} aria-hidden="true">
                  {columns.map((column) => (
                    <td key={column.key}>
                      <Skeleton width="70%" height={12} />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => event.key === "Enter" && onRowClick(row)
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.align === "end"
                          ? "text-end ui-kpi-value"
                          : undefined
                      }
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
