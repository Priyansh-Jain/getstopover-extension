import type { Card } from "../types";
import { programs } from "../data/programs";
import { cityToCode } from "../data/city-codes";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

var KNOWN: Record<string, boolean> = {};
var airlineList: { name: string; lc: string }[] = [];
programs.forEach(function (p) {
  KNOWN[p.airport] = true;
  airlineList.push({ name: p.airline, lc: p.airline.toLowerCase() });
});

function findCards(): HTMLElement[] {
  var c = document.querySelectorAll(".J_FlightItem");
  if (!c.length) c = document.querySelectorAll("div.result-item");
  return Array.prototype.slice.call(c) as HTMLElement[];
}

function route(): { origin: string | null; dest: string | null } {
  var p = new URLSearchParams(location.search);
  var d = (p.get("dcity") || "").toUpperCase(), a = (p.get("acity") || "").toUpperCase();
  return { origin: /^[A-Z]{3}$/.test(d) ? d : null, dest: /^[A-Z]{3}$/.test(a) ? a : null };
}

function durMin(s: string): number {
  var h = s.match(/(\d+)\s*h/), m = s.match(/(\d+)\s*m/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function connectionsFrom(text: string, origin: string | null, dest: string | null): { code: string; min: number }[] {
  var out: { code: string; min: number }[] = [], seen: Record<string, boolean> = {};
  var re = /(\d+h\s*\d*m|\d+m)\s+in\s+([^\n]+)/g, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    var code = cityToCode(m[2]);
    if (!code || code === origin || code === dest || seen[code]) continue;
    seen[code] = true;
    out.push({ code: code, min: durMin(m[1]) });
  }
  return out;
}

function carriers(text: string): string[] {
  var low = text.toLowerCase(), names: string[] = [], seen: Record<string, boolean> = {};
  for (var i = 0; i < airlineList.length; i++) {
    if (low.indexOf(airlineList[i].lc) !== -1 && !seen[airlineList[i].name]) {
      seen[airlineList[i].name] = true;
      names.push(airlineList[i].name);
    }
  }
  return names;
}

function parseCard(card: HTMLElement): Card | null {
  var text = card.innerText || card.textContent || "";
  if (/\bnonstop\b/i.test(text)) return null;
  var r = route();
  var conns = connectionsFrom(text, r.origin, r.dest);
  var naStops = naStopsFromConns(conns);
  if (!conns.length && !naStops.length) return null;
  var layovers: Record<string, number> = {}, stops: string[] = [];
  conns.forEach(function (c) {
    layovers[c.code] = c.min;
    if (KNOWN[c.code]) stops.push(c.code);
  });
  return {
    stops: stops,
    layovers: layovers,
    carriers: carriers(text),
    selfTransfer: /self[\s-]?transfer|separate ticket/i.test(text),
    origin: r.origin || undefined,
    dest: r.dest || undefined,
    naStops: naStops,
    connections: conns,
  };
}

registerAdapter({
  id: "trip",
  matches: function () {
    return location.hostname.indexOf("trip.com") !== -1 && /\/flights\//i.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  badgeInline: true,
});
