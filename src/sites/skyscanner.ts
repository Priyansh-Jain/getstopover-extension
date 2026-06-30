/*
 * GetStopover — Skyscanner site adapter.
 *
 * Connection detection is scoped to stop-specific elements AND excludes the
 * searched origin/destination, so flying TO a hub no longer false-badges.
 * The results-list card exposes only the TOTAL trip time, not per-stop layover.
 * The expanded itinerary view does expose it (e.g. "Connection in airport. X hours
 * Y minutes between flights"), so we read layover duration there instead.
 */
import type { Card } from "../types";
import { programs } from "../data/programs";
import { naStopsFromCodes } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

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
  var wraps = document.querySelectorAll('[class*="Itinerary_itineraryWrapper"]');
  for (var i = 0; i < wraps.length; i++) {
    var el = wraps[i] as HTMLElement;
    if (/between flights/i.test(el.textContent || "")) out.push(el);
  }
  return out;
}

function isItinerary(el: HTMLElement): boolean {
  var cls = typeof el.className === "string" ? el.className : "";
  return /Itinerary_itineraryWrapper/.test(cls) && /between flights/i.test(el.textContent || "");
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

registerAdapter({
  id: "skyscanner",
  matches: function () {
    return location.hostname.indexOf("skyscanner.") !== -1 &&
      /\/transport\/flights\//.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  badgeInline: true,
  skipRot: function () { return /\/config\//.test(location.pathname); },
  badgeAnchor: function (cardEl) {
    if (isItinerary(cardEl)) {
      var top = cardEl.querySelector('[class*="LegSummary_container"]');
      if (top) return top as HTMLElement;
    }
    return cardEl;
  },
});
