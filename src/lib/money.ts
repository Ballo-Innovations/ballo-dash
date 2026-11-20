/**
 * Money (F-09). Amounts are stored as integer minor units (ngwee for ZMW) in the company's currency
 * (companies.currency). Format only at the edge, never do arithmetic on formatted strings.
 */
export const DEFAULT_CURRENCY = "ZMW";
export const DEFAULT_LOCALE = "en-ZM";

/** Number of minor-unit digits for a currency (2 for ZMW and USD, 0 for JPY). */
export function minorDigits(currency: string = DEFAULT_CURRENCY): number {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

/** Major units (as typed by a person, e.g. 1250.5) to integer minor units, rounded half away from zero. */
export function toMinorUnits(
  major: number,
  currency: string = DEFAULT_CURRENCY,
): number {
  // Shift by the decimal exponent rather than multiplying, so 1.005 becomes 101 and not 100.
  const scaled = Math.round(
    Number(`${Math.abs(major)}e${minorDigits(currency)}`),
  );
  return major < 0 ? -scaled : scaled;
}

export function fromMinorUnits(
  minor: number,
  currency: string = DEFAULT_CURRENCY,
): number {
  return minor / 10 ** minorDigits(currency);
}

export interface FormatMoneyOptions {
  currency?: string | null;
  locale?: string;
  /** Drop the minor units when they are zero, e.g. "K1,200" instead of "K1,200.00". */
  trimZeroMinor?: boolean;
  /** Short form for tight spaces: "K1.2M". */
  compact?: boolean;
}

/** formatMoney(123450) -> "K1,234.50" (ZMW by default). */
export function formatMoney(
  minor: number | null | undefined,
  options: FormatMoneyOptions = {},
): string {
  const currency = options.currency || DEFAULT_CURRENCY;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const major = fromMinorUnits(minor ?? 0, currency);
  const digits = minorDigits(currency);
  const trim = options.trimZeroMinor && Number.isInteger(major);
  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: options.compact ? "compact" : "standard",
      minimumFractionDigits: options.compact || trim ? 0 : digits,
      maximumFractionDigits: options.compact ? 1 : digits,
    })
      .format(major)
      // Engines differ on a space between the symbol and the digits ("K 1,234.50"); Zambia writes K1,234.50.
      .replace(/([^\d\s-])[\s\u00a0\u202f]+(?=\d)/, "$1")
  );
}
