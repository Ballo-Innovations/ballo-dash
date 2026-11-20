import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  filtersToQuery,
  parseFilters,
  resolveRange,
  type Filters,
} from "@/lib/filters";

const FILTER_KEYS = ["period", "from", "to", "brand"];

/** Page filters from the URL (F-11). setFilters updates the URL without a full reload; other params are kept. */
export function useFilters() {
  const router = useRouter();
  const filters = useMemo(() => parseFilters(router.query), [router.query]);
  const range = useMemo(() => resolveRange(filters), [filters]);

  const setFilters = useCallback(
    (next: Partial<Filters>) => {
      const merged = { ...filters, ...next };
      const rest = Object.fromEntries(
        Object.entries(router.query).filter(
          ([key]) => !FILTER_KEYS.includes(key),
        ),
      );
      void router.replace(
        {
          pathname: router.pathname,
          query: { ...rest, ...filtersToQuery(merged) },
        },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [filters, router],
  );

  return { filters, range, setFilters };
}
