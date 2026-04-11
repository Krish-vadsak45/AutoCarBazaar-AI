/** VIP tiers use `Vendor.priority` (1–5). Single source of truth for feature gates. */

export const VIP_MIN = 1;
export const VIP_MAX = 5;

export function normalizeVendorPriority(priority: unknown): number {
  const n = Number(priority);
  if (!Number.isFinite(n)) return 1;
  return Math.min(VIP_MAX, Math.max(VIP_MIN, Math.floor(n)));
}

/** Rich Support Chat (Images, Video, etc.) — vendor priority > 1 */
export function canUseRichSupportChat(priority: unknown): boolean {
  return normalizeVendorPriority(priority) > 1;
}

/** Listing video upload on car — acting vendor priority > 2 */
export function canAddListingVideo(priority: unknown): boolean {
  return normalizeVendorPriority(priority) > 2;
}

/** Smart Add (AI) — vendor priority > 3 */
export function canUseSmartAddAi(priority: unknown): boolean {
  return normalizeVendorPriority(priority) > 3;
}

/** Bulk CSV — vendor priority > 4 */
export function canUseBulkUpload(priority: unknown): boolean {
  return normalizeVendorPriority(priority) > 4;
}
