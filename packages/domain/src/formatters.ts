export function formatKurus(value: number, locale = "tr-TR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "TRY" }).format(value / 100);
}

export function formatStock(value: number, locale = "tr-TR"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export const isValidKurus = isNonNegativeInteger;
export const isValidStock = isNonNegativeInteger;
