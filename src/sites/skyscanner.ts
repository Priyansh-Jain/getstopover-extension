/*
 * GetStopover — Skyscanner site adapter.
 *
 * Connection detection is scoped to stop-specific elements AND excludes the
 * searched origin/destination, so flying TO a hub no longer false-badges.
 * Layover-duration reading is OFF until the live-DOM probe confirms the source
 * (guessing risks mis-reading the total trip duration) -> engine shows GREY.
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

function parseCard(cardEl: HTMLElement): Card | null {
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
});
