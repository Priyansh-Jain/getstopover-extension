/*
 * GetStopover — Kayak site adapter.
 *
 * Connection codes are taken from stop/segment elements where possible (falling
 * back to a whole-card scan) and the searched origin/destination (from the URL,
 * e.g. /flights/DEL-JFK/...) are excluded so flying TO a hub doesn't false-badge.
 * Layover-duration reading is OFF until the Kayak console probe confirms where
 * the per-leg time lives -> engine shows GREY ("verify") until then.
 */
import type { Card } from "../types";
import { programs } from "../data/programs";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

interface Route {
  origin: string | null;
  destination: string | null;
}

var KNOWN: Record<string, boolean> = {};
programs.forEach(function (p) { KNOWN[p.airport] = true; });

function route(): Route {
  var m = location.pathname.match(/\/flights\/([A-Za-z]{3})-([A-Za-z]{3})/);
  if (!m) return { origin: null, destination: null };
  return { origin: m[1].toUpperCase(), destination: m[2].toUpperCase() };
}

function findCards(): HTMLElement[] {
  var c = document.querySelectorAll(
    'div[class*="nrc6"], [data-resultid], div[class*="resultInner"], div[class*="result-item"]'
  );
  return Array.prototype.slice.call(c) as HTMLElement[];
}

function stopCodes(card: HTMLElement, r: Route): string[] {
  var found: string[] = [], seen: Record<string, boolean> = {};
  var els = card.querySelectorAll(
    '[class*="stop"], [class*="Stop"], [class*="layover"], [class*="Layover"], [class*="segment"], [class*="c_cgF"]'
  );
  var pool: ArrayLike<Element> = els.length ? els : [card];
  for (var i = 0; i < pool.length; i++) {
    var codes = (pool[i].textContent || "").toUpperCase().match(/\b[A-Z]{3}\b/g) || [];
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

function carriers(card: HTMLElement): string[] {
  var names: string[] = [], seen: Record<string, boolean> = {};
  var imgs = card.querySelectorAll("img[alt]");
  for (var i = 0; i < imgs.length; i++) {
    var a = (imgs[i].getAttribute("alt") || "").trim();
    if (a && a.length > 1 && a.length < 40 && !seen[a.toLowerCase()]) {
      seen[a.toLowerCase()] = true; names.push(a);
    }
  }
  return names;
}

function connections(text: string, r: Route): { code: string; min: number }[] {
  var out: { code: string; min: number }[] = [], seen: Record<string, boolean> = {};
  var re = /\b([A-Z]{3})\b\s+(\d+)h\s*(\d+)?m?\s+layover/g, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    var code = m[1];
    if (code === r.origin || code === r.destination || seen[code]) continue;
    seen[code] = true;
    out.push({ code: code, min: parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0) });
  }
  return out;
}

function parseCard(card: HTMLElement): Card | null {
  var r = route();
  var text = card.innerText || card.textContent || "";
  if (/\bnon[\s-]?stop\b/i.test(text)) return null;
  var codes = stopCodes(card, r);
  var conns = connections(text, r);
  var naStops = naStopsFromConns(conns);
  if (!codes.length && !naStops.length && !conns.length) return null;
  var selfTransfer = /self[\s-]?transfer|separate ticket/i.test(text);
  return {
    stops: codes, layovers: {}, carriers: carriers(card), selfTransfer: selfTransfer,
    origin: r.origin || undefined, dest: r.destination || undefined, naStops: naStops, connections: conns,
  };
}

registerAdapter({
  id: "kayak",
  matches: function () {
    return location.hostname.indexOf("kayak.") !== -1 && /\/flights\//.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  badgePos: "bottom",
  badgeAnchor: function (cardEl) {
    return cardEl.querySelector(".nrc6-wrapper") as HTMLElement | null;
  },
});
