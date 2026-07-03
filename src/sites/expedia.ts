import type { Cabin, Card } from "../types";
import { cabinFromLabel } from "../core/cabin";
import { programs } from "../data/programs";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

var KNOWN: Record<string, boolean> = {};
var airlineList: { name: string; lc: string }[] = [];
programs.forEach(function (p) {
  KNOWN[p.airport] = true;
  airlineList.push({ name: p.airline, lc: p.airline.toLowerCase() });
});

function findCards(): HTMLElement[] {
  var c = document.querySelectorAll('[data-test-id="offer-listing"]');
  return Array.prototype.slice.call(c) as HTMLElement[];
}

function route(text: string): { origin: string | null; dest: string | null } {
  var m = text.match(/\(([A-Z]{3})\)/g);
  if (!m || m.length < 2) return { origin: null, dest: null };
  return { origin: m[0].replace(/[()]/g, ""), dest: m[m.length - 1].replace(/[()]/g, "") };
}

function durMin(s: string): number {
  var h = s.match(/(\d+)\s*h/), m = s.match(/(\d+)\s*m/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function connectionsFrom(text: string, origin: string | null, dest: string | null): { code: string; min: number }[] {
  var out: { code: string; min: number }[] = [], seen: Record<string, boolean> = {};
  var re = /(\d+h(?:\s*\d+m)?|\d+m)\s+in\s+([A-Z]{3})\b/g, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    var code = m[2];
    if (code === origin || code === dest) continue;
    var min = durMin(m[1]);
    if (seen[code + "_" + min]) continue;
    seen[code + "_" + min] = true;
    out.push({ code: code, min: min });
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
  var r = route(text);
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

function searchCabin(): Cabin | null {
  var m = location.search.match(/cabinclass[^a-z]{0,3}(coach|economy|premium|business|first)/i);
  if (m) return cabinFromLabel(m[1]);
  var t = (document.body.innerText || "").slice(0, 4000).match(/travell?ers?,\s*(premium economy|economy|business|first)/i);
  return t ? cabinFromLabel(t[1]) : null;
}

registerAdapter({
  id: "expedia",
  matches: function () {
    return location.hostname.indexOf("expedia.") !== -1 && /\/Flights?-Search/i.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  searchCabin: searchCabin,
  badgeInline: true,
  badgeAnchor: function (cardEl) {
    var box = cardEl.firstElementChild;
    return (box && box.tagName === "DIV" ? box : cardEl) as HTMLElement;
  },
});
