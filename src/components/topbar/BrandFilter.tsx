import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useFilters } from "@/hooks/useFilters";
import { getJson } from "@/lib/api-client";

interface Brand {
  id: string;
  name: string;
  isSelf: boolean;
}

/** Brand filter (F-11): all brands, the company's own, or one competitor. Stored in the URL. */
export default function BrandFilter() {
  const { filters, setFilters } = useFilters();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let live = true;
    void getJson<{ brands: Brand[] }>("/api/brands").then((result) => {
      if (live && result.ok) setBrands(result.data.brands);
    });
    return () => {
      live = false;
    };
  }, []);

  if (brands.length === 0) return null;
  const selected = brands.find((brand) => brand.id === filters.brand);
  const label = selected ? selected.name : "All brands";

  return (
    <Dropdown as="li" className="pc-h-item topbar-filter">
      <Dropdown.Toggle
        as="button"
        type="button"
        className="pc-head-link topbar-filter-toggle"
        aria-label={`Brand: ${label}`}
      >
        <i className="ph-duotone ph-tag" aria-hidden="true"></i>
        <span className="topbar-filter-label">{label}</span>
        <i className="ph ph-caret-down" aria-hidden="true"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu className="pc-h-dropdown topbar-filter-menu">
        <Dropdown.Item
          as="button"
          type="button"
          active={!selected}
          onClick={() => setFilters({ brand: undefined })}
        >
          All brands
        </Dropdown.Item>
        <Dropdown.Divider />
        {brands.map((brand) => (
          <Dropdown.Item
            key={brand.id}
            as="button"
            type="button"
            active={brand.id === filters.brand}
            onClick={() => setFilters({ brand: brand.id })}
          >
            {brand.name}
            {brand.isSelf && (
              <span className="text-muted small ms-1">(you)</span>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
