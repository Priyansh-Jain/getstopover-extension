/*
 * GetStopover — Kiwi site adapter.
 *
 * Primary source is the "data-gs-kiwi" attribute stamped by the main-world
 * bridge (src/kiwi-main.ts): exact per-connection layover minutes, station
 * codes, carriers, and pnrCount-based self-transfer, straight from Kiwi's own
 * itinerary objects. When the bridge hasn't stamped a card (React internals
 * changed, or the stamp raced the scan), the fallback text parse yields stop
 * codes with NO durations, so the engine renders a grey "verify" chip instead
 * of inventing a layover.
 */
import type { Cabin, Card } from "../types";
import { cabinFromLabel } from "../core/cabin";
import { programs } from "../data/programs";
import { cityToCode } from "../data/city-codes";
import { naStopsFromCodes } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

var KNOWN: Record<string, boolean> = {};
var airlineList: { name: string; lc: string }[] = [];
programs.forEach(function (p) {
  KNOWN[p.airport] = true;
  airlineList.push({ name: p.airline, lc: p.airline.toLowerCase() });
});

function findCards(): HTMLElement[] {
  var c = document.querySelectorAll('[data-test="ResultCardWrapper"]');
  return Array.prototype.slice.call(c) as HTMLElement[];
}

function carriersFromText(text: string): string[] {
  var low = text.toLowerCase(), names: string[] = [], seen: Record<string, boolean> = {};
  for (var i = 0; i < airlineList.length; i++) {
    if (low.indexOf(airlineList[i].lc) !== -1 && !seen[airlineList[i].name]) {
      seen[airlineList[i].name] = true;
      names.push(airlineList[i].name);
    }
  }
  return names;
}

interface BridgePayload {
  origin?: string | null;
  dest?: string | null;
  conns?: { code?: string; min?: number }[];
  carriers?: string[];
  selfTransfer?: boolean;
}

function code3(s: unknown): string | null {
  return typeof s === "string" && /^[A-Z]{3}$/.test(s) ? s : null;
}

function fromBridge(card: HTMLElement, text: string): Card | null {
  var raw = card.getAttribute("data-gs-kiwi");
  if (!raw) return null;
  var d: BridgePayload;
  try { d = JSON.parse(raw) as BridgePayload; } catch (e) { return null; }
  if (!d || !d.conns) return null;

  var origin = code3(d.origin), dest = code3(d.dest);
  var conns: { code: string; min: number }[] = [];
  var stops: string[] = [];
  var layovers: Record<string, number> = {};
  for (var i = 0; i < d.conns.length; i++) {
    var c = d.conns[i];
    var cc = c ? code3(c.code) : null;
    if (!cc || cc === origin || cc === dest) continue;
    var min = c && typeof c.min === "number" && c.min > 0 && c.min < 60000 ? Math.round(c.min) : 0;
    if (min <= 0) continue;
    conns.push({ code: cc, min: min });
    if (layovers[cc] == null) layovers[cc] = min;
    if (KNOWN[cc] && stops.indexOf(cc) === -1) stops.push(cc);
  }

  var selfTransfer = !!d.selfTransfer || /self[\s-]?transfer|separate ticket/i.test(text);
  var naStops = naStopsFromCodes(conns.map(function (c2) { return c2.code; }), origin, dest);
  if (!conns.length && !naStops.length && !selfTransfer) return null;

  var names: string[] = [];
  if (d.carriers && d.carriers.length) {
    for (var k = 0; k < d.carriers.length && names.length < 8; k++) {
      var n = d.carriers[k];
      if (typeof n === "string" && n.length > 1 && n.length < 40 && names.indexOf(n) === -1) names.push(n);
    }
  }

  return {
    stops: stops,
    layovers: layovers,
    carriers: names.length ? names : carriersFromText(text),
    selfTransfer: selfTransfer,
    origin: origin || undefined,
    dest: dest || undefined,
    naStops: naStops,
    connections: conns,
  };
}

function fromText(card: HTMLElement, text: string): Card | null {
  if (document.documentElement.getAttribute("data-gs-kiwi-bridge")) return null;
  var codes = text.match(/\b[A-Z]{3}\b/g) || [];
  var origin = codes[0] || null, dest = codes[1] || null;
  var selfTransfer = /self[\s-]?transfer|separate ticket/i.test(text);

  var hubCodes: string[] = [], seen: Record<string, boolean> = {};
  var m = text.match(/\d+\s*stops?\s*[·•]\s*([^\n|]+)/);
  if (m) {
    var cities = m[1].split(/\s*,\s*/);
    for (var i = 0; i < cities.length; i++) {
      var code = cityToCode(cities[i]);
      if (!code || code === origin || code === dest || seen[code]) continue;
      seen[code] = true;
      hubCodes.push(code);
    }
  }
  var naStops = naStopsFromCodes(hubCodes, origin, dest);
  var stops: string[] = [];
  for (var j = 0; j < hubCodes.length; j++) if (KNOWN[hubCodes[j]]) stops.push(hubCodes[j]);
  if (!stops.length && !naStops.length && !selfTransfer) return null;

  return {
    stops: stops,
    layovers: {},
    carriers: carriersFromText(text),
    selfTransfer: selfTransfer,
    origin: origin || undefined,
    dest: dest || undefined,
    naStops: naStops,
    connections: [],
  };
}

function parseCard(card: HTMLElement): Card | null {
  var text = card.innerText || card.textContent || "";
  return fromBridge(card, text) || fromText(card, text);
}

function searchCabin(): Cabin | null {
  var m = location.search.toLowerCase().match(/(premium[_ ]?economy|economy|business|first)/);
  if (m) return cabinFromLabel(m[1]);
  var t = (document.body.innerText || "").slice(0, 1200).match(/\b(premium economy|economy|business|first)\b/i);
  return t ? cabinFromLabel(t[1]) : null;
}

registerAdapter({
  id: "kiwi",
  matches: function () {
    return location.hostname.indexOf("kiwi.com") !== -1 && /\/search\//i.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  searchCabin: searchCabin,
  badgeAnchor: function (cardEl) {
    var bag = cardEl.querySelector('[data-test="BaggageBreakdown"]');
    var el: HTMLElement | null = bag as HTMLElement | null;
    for (var up = 0; up < 8 && el; up++) {
      try {
        if (getComputedStyle(el).display === "flex" && el.getBoundingClientRect().width > 300) return el;
      } catch (e) { /* ignore */ }
      el = el.parentElement;
    }
    return cardEl;
  },
  badgeAppendInline: true,
});
