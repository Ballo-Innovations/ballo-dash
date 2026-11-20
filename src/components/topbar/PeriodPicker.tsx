import { useEffect, useState, type FormEvent } from "react";
import { Dropdown } from "react-bootstrap";
import { useFilters } from "@/hooks/useFilters";
import { PERIOD_LABELS, PERIOD_PRESETS } from "@/lib/filters";
import { formatDate } from "@/lib/periods";

/** 7d / 30d / 90d / custom period, shared by every page through the URL (F-11). */
export default function PeriodPicker() {
  const { filters, range, setFilters } = useFilters();
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setFrom(filters.from ?? "");
    setTo(filters.to ?? "");
  }, [filters.from, filters.to]);

  const label =
    filters.period === "custom"
      ? `${formatDate(range.start)} to ${formatDate(new Date(range.end.getTime() - 1))}`
      : PERIOD_LABELS[filters.period];
  const customInvalid = !from || !to || from > to;

  function applyCustom(event: FormEvent) {
    event.preventDefault();
    if (customInvalid) return;
    setFilters({ period: "custom", from, to });
    setShow(false);
  }

  return (
    <Dropdown
      as="li"
      className="pc-h-item topbar-filter"
      show={show}
      onToggle={(next) => setShow(next)}
      autoClose="outside"
    >
      <Dropdown.Toggle
        as="button"
        type="button"
        className="pc-head-link topbar-filter-toggle"
        aria-label={`Period: ${label}`}
      >
        <i className="ph-duotone ph-calendar-blank" aria-hidden="true"></i>
        <span className="topbar-filter-label">{label}</span>
        <i className="ph ph-caret-down" aria-hidden="true"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu className="pc-h-dropdown topbar-filter-menu">
        {PERIOD_PRESETS.map((preset) => (
          <Dropdown.Item
            key={preset}
            as="button"
            type="button"
            active={filters.period === preset}
            aria-current={filters.period === preset ? "true" : undefined}
            onClick={() => {
              setFilters({ period: preset, from: undefined, to: undefined });
              setShow(false);
            }}
          >
            {PERIOD_LABELS[preset]}
          </Dropdown.Item>
        ))}
        <Dropdown.Divider />
        <form className="px-3 pb-2" onSubmit={applyCustom}>
          <p className="mb-2 fw-semibold">Custom range</p>
          <div className="d-flex gap-2 mb-2">
            <label className="flex-fill small">
              From
              <input
                type="date"
                className="form-control form-control-sm"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="flex-fill small">
              To
              <input
                type="date"
                className="form-control form-control-sm"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-sm btn-primary w-100"
            disabled={customInvalid}
          >
            Apply
          </button>
        </form>
      </Dropdown.Menu>
    </Dropdown>
  );
}
