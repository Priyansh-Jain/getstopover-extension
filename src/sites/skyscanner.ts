/*
 * GetStopover — Skyscanner site adapter.
 *
 * Connection detection is scoped to stop-specific elements AND excludes the
 * searched origin/destination, so flying TO a hub no longer false-badges.
 * The results-list card exposes only the TOTAL trip time, not per-stop layover.
 * The booking (DayView /config) page's flight-details panel does expose it
 * (e.g. "Connection in airport. X hours Y minutes between flights"), so we read
 * layover duration there and upgrade the grey "stopover possible" chip to a real
 * verdict. That panel lives in per-leg [data-testid="itinerary-leg-<id>"] wrappers.
 */
import type { Cabin, Card, Verdict } from "../types";
import { cabinFromLabel } from "../core/cabin";
import { programs } from "../data/programs";
import { naStopsFromCodes } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";
import { badge } from "../core/badge";

interface Route {
  origin: string | null;
  destination: string | null;
}

var KNOWN: Record<string, boolean> = {};
programs.forEach(function (p) { KNOWN[p.airport] = true; });

function findCards(): HTMLElement[] {
  var det = detailItineraries();
  if (det.length) return det;
  var c = document.querySelectorAll('[data-testid="ticket"]');
  if (c.length) return Array.prototype.slice.call(c) as HTMLElement[];
  c = document.querySelectorAll('[class*="FlightsTicket_container"]');
  return Array.prototype.slice.call(c) as HTMLElement[];
}

function route(): Route {
  var m = location.pathname.match(/\/transport\/flights\/([a-z0-9-]+)\/([a-z0-9-]+)\//i);
  if (!m) return { origin: null, destination: null };
  return { origin: m[1].toUpperCase(), destination: m[2].toUpperCase() };
}

function stopCodes(cardEl: HTMLElement, r: Route): string[] {
  var found: string[] = [], seen: Record<string, boolean> = {};
  var els = cardEl.querySelectorAll(
    '[class*="Stops_stopStation"], [class*="Stops_stopsTooltip"], ' +
    '[class*="LegInfo_stop"], [class*="legStop"], [class*="Stop_stop"]'
  );
  for (var i = 0; i < els.length; i++) {
    var codes = (els[i].textContent || "").toUpperCase().match(/\b[A-Z]{3}\b/g) || [];
    for (var j = 0; j < codes.length; j++) {
      var code = codes[j];
      if (seen[code]) continue;
      if (code === r.origin || code === r.destination) continue;
      if (!KNOWN[code]) continue;
      seen[code] = true;
      found.push(code);
    }
  }
  return found;
}

function carriers(cardEl: HTMLElement): string[] {
  var names: string[] = [], seen: Record<string, boolean> = {};
  function push(s: string | null): void {
    s = (s || "").trim();
    if (s && s.length > 1 && s.length < 40 && !seen[s.toLowerCase()]) {
      seen[s.toLowerCase()] = true; names.push(s);
    }
  }
  var imgs = cardEl.querySelectorAll("img[alt]");
  for (var i = 0; i < imgs.length; i++) push(imgs[i].getAttribute("alt"));
  var labels = cardEl.querySelectorAll(
    '[class*="AirlineLogo"], [class*="Carrier"], [class*="carrier"], [class*="airline"]'
  );
  for (var k = 0; k < labels.length; k++) push(labels[k].textContent);
  return names;
}

function naStopCodes(cardEl: HTMLElement, r: Route): string[] {
  var codes: string[] = [];
  var els = cardEl.querySelectorAll(
    '[class*="Stops_stopStation"], [class*="Stops_stopsTooltip"], ' +
    '[class*="LegInfo_stop"], [class*="legStop"], [class*="Stop_stop"]'
  );
  for (var i = 0; i < els.length; i++) {
    var found = (els[i].textContent || "").toUpperCase().match(/\b[A-Z]{3}\b/g) || [];
    for (var j = 0; j < found.length; j++) codes.push(found[j]);
  }
  return naStopsFromCodes(codes, r.origin, r.destination);
}

function detailItineraries(): HTMLElement[] {
  var out: HTMLElement[] = [];
  var wraps = document.querySelectorAll('[data-testid^="itinerary-leg-"]');
  for (var i = 0; i < wraps.length; i++) {
    var el = wraps[i] as HTMLElement;
    if (/between flights/i.test(el.textContent || "")) out.push(el);
  }
  return out;
}

function isItinerary(el: HTMLElement): boolean {
  var tid = el.getAttribute ? (el.getAttribute("data-testid") || "") : "";
  return /^itinerary-leg-/.test(tid) && /between flights/i.test(el.textContent || "");
}

function parseItinerary(wrapEl: HTMLElement): Card | null {
  var text = (wrapEl.innerText || wrapEl.textContent || "").replace(/\s+/g, " ");
  var connections: { code: string; min: number }[] = [], stops: string[] = [];
  var layovers: Record<string, number> = {};
  var re = /\b([A-Z]{3})\b[^.\d]{0,90}?connection[^.\d]{0,20}\.\s*(?:(\d+)\s*hours?)?\s*(?:(\d+)\s*minutes?)?\s*between flights/gi;
  var m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    var code = m[1];
    if (!code) continue;
    var min = (m[2] ? parseInt(m[2], 10) : 0) * 60 + (m[3] ? parseInt(m[3], 10) : 0);
    if (min <= 0) continue;
    connections.push({ code: code, min: min });
    layovers[code] = min;
    if (stops.indexOf(code) === -1) stops.push(code);
  }
  if (!connections.length) return null;

  var outbound = text.split(/\bReturn\b|\bInbound\b/i)[0] || "";
  var codes = outbound.match(/\b[A-Z]{3}\b/g) || [];
  var origin = codes.length ? codes[0] : undefined;
  var dest = codes.length ? codes[codes.length - 1] : undefined;

  var names: string[] = [], cseen: Record<string, boolean> = {};
  var cre = /(?:Leg \d+,|flight with)\s+([A-Z][A-Za-z][A-Za-z .'&-]{2,38}?)(?:\.|,|\s+Flight number)/g;
  var cm: RegExpExecArray | null;
  while ((cm = cre.exec(text))) {
    var name = (cm[1] || "").trim();
    if (name && !cseen[name.toLowerCase()]) { cseen[name.toLowerCase()] = true; names.push(name); }
  }

  return {
    stops: stops, layovers: layovers, carriers: names,
    selfTransfer: /self[\s-]?transfer|separate ticket/i.test(text),
    origin: origin, dest: dest, connections: connections,
  };
}

function parseCard(cardEl: HTMLElement): Card | null {
  if (isItinerary(cardEl)) return parseItinerary(cardEl);
  var r = route();
  var text = cardEl.innerText || cardEl.textContent || "";
  if (/\bnon[\s-]?stop\b/i.test(text)) return null;
  var codes = stopCodes(cardEl, r);
  var naStops = naStopCodes(cardEl, r);
  if (!codes.length && !naStops.length) return null;
  var selfTransfer = /self[\s-]?transfer|separate ticket/i.test(text);
  return {
    stops: codes, layovers: {}, carriers: carriers(cardEl), selfTransfer: selfTransfer,
    origin: r.origin || undefined, dest: r.destination || undefined, naStops: naStops,
  };
}

function searchCabin(): Cabin | null {
  var cc = new URLSearchParams(location.search).get("cabinclass");
  return cc ? cabinFromLabel(cc) : "economy";
}

function isBookingPage(): boolean {
  return /\/config\//.test(location.pathname);
}

function signature(card: Card): string | null {
  if (!card || !card.stops || !card.stops.length) return null;
  return (card.origin || "") + ">" + card.stops.join("-") + ">" + (card.dest || "");
}

// Does a booking-page provider row (its text starts with the seller name) sell
// the stopover airline directly? The free stopover perk only survives a direct
// booking, so we only tag the airline's own row.
function agentAirlineMatches(agentText: string, airline: string): boolean {
  var pa = (agentText || "").toLowerCase();
  var toks = (airline || "").toLowerCase()
    .replace(/\b(airlines?|airways?|air)\b/g, " ")
    .split(/\s+/).filter(function (t) { return t.length >= 2; });
  if (!toks.length) return false;
  return toks.every(function (t) { return pa.indexOf(t) >= 0; });
}

// Booking (DayView) page only: drop a compact "Stopover" chip beside the
// "Airline" tag on the airline's own provider row in the "Book your ticket"
// list, so the free-stopover perk points at the deal that actually keeps it.
function markBooking(v: Verdict): void {
  if (!isBookingPage() || v.selfTransfer) return;
  var tags = document.querySelectorAll('[class*="AgentDetails_agentDetails"] [class*="BpkBadge"]');
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i] as HTMLElement;
    if ((tag.textContent || "").trim().toLowerCase() !== "airline") continue;
    var agent = tag.closest('[class*="AgentDetails_agentDetails"]') as HTMLElement | null;
    if (!agent) continue;
    if (!agentAirlineMatches(agent.textContent || "", v.airline)) continue;
    if (agent.querySelector("[data-getstopover-badge]")) continue;
    tag.insertAdjacentElement("afterend", badge.stopoverTag(v, false));
  }
}

registerAdapter({
  id: "skyscanner",
  matches: function () {
    return location.hostname.indexOf("skyscanner.") !== -1 &&
      /\/transport\/flights\//.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  searchCabin: searchCabin,
  badgeInline: true,
  skipRot: function () { return isBookingPage(); },
  badgeAnchor: function (cardEl) {
    if (isItinerary(cardEl)) {
      var top = cardEl.querySelector('[data-testid="leg-summary"]') ||
        cardEl.querySelector('[class*="LegSummary_container"]');
      if (top) return top as HTMLElement;
    }
    return cardEl;
  },
  findSelected: function () { return isBookingPage() ? detailItineraries() : []; },
  signature: signature,
  markBooking: markBooking,
  skipSelectedChip: true,
});
