import type { Card } from "../types";
import { programs } from "../data/programs";
import { cityToCode } from "../data/city-codes";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

var UNKNOWN_LAYOVER = 999;

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
  var codes = text.match(/\b[A-Z]{3}\b/g) || [];
  var origin = codes[0] || null, dest = codes[1] || null;
  var selfTransfer = /self[\s-]?transfer|separate ticket/i.test(text);

  var conns: { code: string; min: number }[] = [], seen: Record<string, boolean> = {};
  var m = text.match(/\d+\s*stops?\s*[·•]\s*([^\n|]+)/);
  if (m) {
    var cities = m[1].split(/\s*,\s*/);
    for (var i = 0; i < cities.length; i++) {
      var code = cityToCode(cities[i]);
      if (!code || code === origin || code === dest || seen[code]) continue;
      seen[code] = true;
      conns.push({ code: code, min: UNKNOWN_LAYOVER });
    }
  }
  var naStops = naStopsFromConns(conns);
  if (!conns.length && !naStops.length && !selfTransfer) return null;

  var stops: string[] = [];
  for (var j = 0; j < conns.length; j++) if (KNOWN[conns[j].code]) stops.push(conns[j].code);

  return {
    stops: stops,
    layovers: {},
    carriers: carriers(text),
    selfTransfer: selfTransfer,
    origin: origin || undefined,
    dest: dest || undefined,
    naStops: naStops,
    connections: conns,
  };
}

registerAdapter({
  id: "kiwi",
  matches: function () {
    return location.hostname.indexOf("kiwi.com") !== -1 && /\/search\//i.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  badgeInline: true,
});
