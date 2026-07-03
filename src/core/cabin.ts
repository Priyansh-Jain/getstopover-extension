/*
 * GetStopover — searched-cabin detection helpers.
 *
 * cabinFromLabel maps a site's cabin label/param to a bucket. "Premium economy"
 * deliberately lands in "economy": for eligibility purposes a PE search should be
 * gated like economy (a business/first-only programme excludes PE passengers too).
 * The standalone "premium" bucket only appears where a site names PE just
 * "premium" (Kayak's path segment).
 */
import type { Cabin } from "../types";

export function cabinFromLabel(s: string | null | undefined): Cabin | null {
  if (!s) return null;
  var t = s.toLowerCase();
  if (/first/.test(t)) return "first";
  if (/business/.test(t)) return "business";
  if (/econom|coach/.test(t)) return "economy";
  if (/premium/.test(t)) return "premium";
  return null;
}

// True when the programme's eligible-cabins list admits an economy-tier ticket.
// An empty list means the data doesn't restrict cabins, so never gate on it.
export function economyEligible(cabins: string[]): boolean {
  for (var i = 0; i < cabins.length; i++) {
    if (/econom|premium/i.test(cabins[i])) return true;
  }
  return false;
}
