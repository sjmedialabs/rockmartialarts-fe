/**
 * Strip trailing " (uuid)" from price strings so we never show internal IDs to users.
 * Handles format like "₹1500 (47c25d66-5fb5-4017-8681-48b986f0ebb0)" -> "₹1500"
 */
const UUID_IN_PARENS = /\s*\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)\s*$/i

export function stripUuidFromPriceDisplay(priceStr: string | null | undefined): string {
  if (priceStr == null || typeof priceStr !== "string") return ""
  const cleaned = priceStr.replace(UUID_IN_PARENS, "").trim()
  return cleaned || priceStr
}
