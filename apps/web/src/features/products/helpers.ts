import { formatKurus, formatStock, productStatus } from "@stokmate/domain";

export const pageSizes = [10, 20, 50];
export const sortOptions = [["name", "Ad"], ["price", "Fiyat"], ["stock", "Stok"], ["updatedAt", "Güncelleme"]] as const;

export function positiveInt(value: string | null, fallback: number) {
  return Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
}

export function optionalId(value: string | null) {
  return Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : undefined;
}

export function tlToKurus(value: string): number | null {
  const raw = value.replace(/[₺TL\s]/gi, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

export function dateValue(value: string | undefined, locale: string) {
  return value ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

export function statusLabel(status: number | undefined) {
  return status === productStatus.active ? "Aktif" : status === productStatus.inactive ? "Pasif" : status === productStatus.discontinued ? "Satış dışı" : "Bilinmiyor";
}

export { formatKurus, formatStock };
