/*
 * GetStopover — eligibility + usable-hours + value engine (DOM-independent).
 *
 * Ported from the Stop Over app's lib/db/programs.ts matching logic, adapted to
 * the limited data a flight-results page exposes. The page never reveals the
 * single-letter fare class (RBD), so any programme with a fare/ticket dependency
 * can only ever reach AMBER ("verify your fare"), never a confident GREEN. GREEN
 * is reserved for carrier-agnostic (airport-run) programmes whose only gate is
 * layover length. GREY means a programme exists but the itinerary couldn't be
 * verified (usually the layover length wasn't readable).
 *
 * Two eligibility windows per programme: the free-HOTEL window (minH..maxH) and,
 * for programmes with a free tour, a usually-wider free-TOUR window
 * (tourMinH..tourMaxH). A layover too short for the hotel can still qualify for
 * the tour, so we surface the tour instead of suppressing the result.
 */
import type { Card, Confidence, Program, Verdict, VisaInfo } from "../types";
import { programs } from "../data/programs";
import { transit } from "../data/transit";
import { visa } from "../data/visa";
import { eligibility } from "../data/eligibility";
import { settings } from "./settings";

const byAirport: Record<string, Program[]> = {};
programs.forEach(function (p) {
  (byAirport[p.airport] = byAirport[p.airport] || []).push(p);
});

function normName(s: string): string {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function usableHours(airport: string, layoverMin: number | null): number | null {
  if (layoverMin == null) return null;
  var t = transit[airport] || transit._default;
  if (!t) return null;
  // "confident traveller" toggle trims the buffer; never below a 60-min floor.
  var adj = settings.bufferAdjustMin || 0;
  var buffer = Math.max(60, t.buffer + adj);
  var net = layoverMin - t.exit - 2 * t.toCity - buffer;
  return net <= 0 ? 0 : Math.round((net / 60) * 10) / 10;
}

function carrierTokens(s: string): string[] {
  return normName(s).replace(/\b(airlines|airways|airline|aviation)\b/g, " ")
    .split(/\s+/).filter(function (t) { return t.length >= 2; });
}
// Whole-token match, not substring: identical token sets, or a multi-token
// subset. Prevents a lone shared token (e.g. "china") cross-matching Air China /
// China Southern / China Eastern — the old substring matcher's false positives.
function tokenMatch(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  var setB: Record<string, boolean> = {};
  b.forEach(function (t) { setB[t] = true; });
  var common = a.filter(function (t) { return setB[t]; }).length;
  if (common === a.length && common === b.length) return true; // identical
  if (common === a.length && a.length >= 2) return true;       // a is a >=2-token subset of b
  if (common === b.length && b.length >= 2) return true;       // b is a >=2-token subset of a
  return false;
}
function carrierKnownMatch(program: Program, carriers: string[]): { known: boolean; match: boolean } {
  if (!carriers || !carriers.length) return { known: false, match: false };
  var code = (program.code || "").toUpperCase();
  var pt = carrierTokens(program.airline);
  var match = carriers.some(function (c) {
    if (code && c.trim().toUpperCase() === code) return true; // exact IATA code, if a card exposes one
    return tokenMatch(pt, carrierTokens(c));
  });
  return { known: true, match: match };
}

// Per-passport transit-visa verdict for a hub country, mirroring the Stop Over
// app's getVisaBadge logic. Returns a status the panel maps to colour/label.
function visaVerdict(country: string): VisaInfo {
  var p = settings.passport;
  if (!p) return { status: "no-passport" };
  var v = visa[p] && visa[p][country];
  if (!v) return { status: "unknown" }; // hub country not in the dataset yet
  if (v.transitFree) return { status: "free", notes: v.notes };
  if (v.voa) return { status: "voa", notes: v.notes };
  if (v.eVisa) return { status: "evisa", notes: v.notes };
  if (v.req) return { status: "required", notes: v.notes };
  return { status: "unknown", notes: v.notes };
}

// card = { stops:[CODE], layovers:{CODE:minutes}, carriers:[name] }
function evaluateCard(card: Card | null): Verdict | null {
  if (!card || !card.stops) return null;
  var stops = card.stops;
  var layovers = card.layovers;
  var carriers = card.carriers;
  var selfTransfer = !!card.selfTransfer;
  var verdicts: Verdict[] = [];

  stops.forEach(function (code) {
    var list = byAirport[code];
    if (!list) return;
    var layoverMin: number | null = layovers && layovers[code] != null ? layovers[code] : null;

    list.forEach(function (p) {
      if (p.status !== "active") return;
      if (p.type === "pass") return;
      if (p.minH == null && p.maxH == null) return;

      var hotelMin = p.minH == null ? 0 : p.minH;
      var hotelMax = p.maxH == null ? 999 : p.maxH;
      var hasTour = p.freeTours && p.tourMinH != null;
      var tourMin = hasTour ? p.tourMinH : null;
      var tourMax = hasTour ? p.tourMaxH : null;

      // Which window does this layover fall in? ('hotel' | 'tour' | 'unknown')
      var mode: "hotel" | "tour" | "unknown";
      if (layoverMin != null) {
        var h = layoverMin / 60;
        if (h >= hotelMin && h <= hotelMax) mode = "hotel";
        else if (hasTour && tourMin != null && tourMax != null && h >= tourMin && h <= tourMax) mode = "tour";
        else return; // outside every window -> no badge
      } else {
        mode = "unknown";
      }

      // Carrier gate (airport-run tours are carrier-agnostic and skip it).
      if (!p.carrierAgnostic) {
        var carrier = carrierKnownMatch(p, carriers);
        if (carrier.known && !carrier.match) return; // wrong airline's ticket
      }

      // A confident GREEN would require positively confirming eligibility (incl.
      // an airport tour's own rules), which a flight page can't. So cap at AMBER:
      // even carrier-agnostic airport tours are "possible for any airline", never
      // a confident "you qualify". GREY when the layover length wasn't readable.
      var stIneligible = selfTransfer && !p.carrierAgnostic;
      var confidence: Confidence = (stIneligible || mode === "unknown") ? "grey" : "amber";

      var elig = eligibility[code] || {};
      // In the tour window the free hotel doesn't apply yet.
      var showHotel = p.freeHotel && mode !== "tour";
      var hotelModel = mode === "tour" ? "tour-only"
        : p.freeHotel ? "free"
        : p.type === "fare" ? "no-airfare-only"
        : p.freeTours ? "tour-only" : "none";
      var hotelConditional = !!(elig.fareFloorUSD || p.exclFares.length);

      var reasons: string[] = [];
      if (stIneligible) reasons.push("This is a self-transfer (separate tickets): the perk needs ONE through-ticket on " + p.airline + ", so it won't apply to this itinerary as booked.");
      if (!p.carrierAgnostic) {
        reasons.push("Book directly with " + p.airline + ". Booking here on an OTA/aggregator (Skyscanner, Kayak, Google Flights) usually voids the free stopover perk.");
        reasons.push("One through-ticket on " + p.airline + ": a self-transfer (separate tickets) won't qualify, and loses missed-connection protection.");
      }
      if (p.exclFares.length) {
        reasons.push("Fare classes " + p.exclFares.join("/") + " are excluded. Verify yours isn't one.");
      } else if (!p.carrierAgnostic) {
        reasons.push("Verify your fare class qualifies.");
      }
      if (elig.fareFloorUSD) reasons.push("Needs a base fare around $" + elig.fareFloorUSD + "+. The cheapest fares are often excluded.");
      if (elig.awardExcluded) reasons.push("Award / miles tickets don't qualify.");
      if (mode === "tour") {
        reasons.push("Layover fits the free city tour (" + tourMin + "–" + tourMax + "h); the free hotel needs a longer stop.");
      }
      if (mode === "unknown") {
        reasons.push("Layover length wasn't readable here. Qualifies on " + hotelMin + "–" + hotelMax + "h" +
          (hasTour && tourMin != null && tourMin < hotelMin ? " (free tour from " + tourMin + "h)" : "") + ".");
      }
      if (elig.shortestConnRule) reasons.push("The free hotel needs the SHORTEST same-day connection. Deliberately picking a longer layover can void it.");
      if (elig.applyDeadlineH) reasons.push("Add it before you buy: request at least " + elig.applyDeadlineH + "h before departure.");
      if (p.freeHotel && !p.carrierAgnostic) {
        reasons.push("Claim only on the airline's official site. Beware lookalike sites/ads and bogus \"verification fee\" requests.");
      }

      verdicts.push({
        confidence: confidence,
        mode: mode,
        airport: code,
        city: p.city,
        country: p.country,
        airline: p.airline,
        programName: p.name,
        slug: p.slug,
        url: p.url,
        layoverMin: layoverMin,
        usableHours: usableHours(code, layoverMin),
        freeHotel: showHotel,
        freeTours: p.freeTours,
        freeVisa: p.freeVisa,
        visa: visaVerdict(p.country),
        maxDays: p.maxDays,
        hotelValueUSD: showHotel ? p.hotelValueUSD : 0,
        hotelModel: hotelModel,
        hotelConditional: hotelConditional,
        windowH: [hotelMin, hotelMax],
        reasons: reasons,
        selfTransfer: stIneligible,
      });
    });
  });

  if (!verdicts.length) return null;
  var rank: Record<Confidence, number> = { green: 3, amber: 2, grey: 1 };
  verdicts.sort(function (a, b) {
    if (rank[b.confidence] !== rank[a.confidence]) return rank[b.confidence] - rank[a.confidence];
    return (b.hotelValueUSD || 0) - (a.hotelValueUSD || 0);
  });
  var primary = verdicts[0];
  var otherHubs: string[] = [], seenCountry: Record<string, boolean> = {};
  seenCountry[primary.country] = true;
  verdicts.forEach(function (v) {
    if (!seenCountry[v.country]) { seenCountry[v.country] = true; otherHubs.push(v.city); }
  });
  if (otherHubs.length) primary.otherHubs = otherHubs;
  return primary;
}

export const engine = {
  evaluateCard: evaluateCard,
  usableHours: usableHours,
  visaVerdict: visaVerdict,
  byAirport: byAirport,
};
