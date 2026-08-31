import type { MiningFilters } from "@/types/mining";

// Filters are serialized into the `f` query param (base64 JSON) so the
// results page is a shareable/bookmarkable URL and needs no client-side
// global state to carry the last search.
export function encodeMiningFilters(filters: MiningFilters): string {
  const json = JSON.stringify(filters);
  const base64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : "";
  return encodeURIComponent(base64);
}

export function decodeMiningFilters(encoded: string | null): MiningFilters | null {
  if (!encoded || typeof window === "undefined") return null;
  try {
    const base64 = decodeURIComponent(encoded);
    const json = decodeURIComponent(escape(window.atob(base64)));
    return JSON.parse(json) as MiningFilters;
  } catch {
    return null;
  }
}
