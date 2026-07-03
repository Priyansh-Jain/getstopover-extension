/*
 * GetStopover — Kayak site adapter.
 *
 * Connection codes are taken from stop/segment elements where possible (falling
 * back to a whole-card scan) and the searched origin/destination (from the URL,
 * e.g. /flights/DEL-JFK/...) are excluded so flying TO a hub doesn't false-badge.
 * Layover-duration reading is OFF until the Kayak console probe confirms where
 * the per-leg time lives -> engine shows GREY ("verify") until then.
 */
import type { BagVerdict, Cabin, Card, FitVerdict, RiskVerdict, Verdict } from "../types";
import { cabinFromLabel } from "../core/cabin";
import { programs } from "../data/programs";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";
import { badge } from "../core/badge";

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
  function add(code: string, min: number): void {
    if (code === r.origin || code === r.destination) return;
    var key = code + "_" + min;
    if (seen[key]) return;
    seen[key] = true;
    out.push({ code: code, min: min });
  }
  var re = /\b([A-Z]{3})\b\s+(\d+)h\s*(\d+)?m?\s+(?:layover|stopover)/g, m: RegExpExecArray | null;
  while ((m = re.exec(text))) add(m[1], parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0));
  var re2 = /(\d+)h\s*(\d+)?m?\s*[•·]?\s*Change planes in\s+[A-Za-z .'-]+\(([A-Z]{3})\)/gi, m2: RegExpExecArray | null;
  while ((m2 = re2.exec(text))) add(m2[3], parseInt(m2[1], 10) * 60 + (m2[2] ? parseInt(m2[2], 10) : 0));
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
  var layovers: Record<string, number> = {};
  conns.forEach(function (c) {
    if (c.min > 0) layovers[c.code] = c.min;
    if (codes.indexOf(c.code) === -1) codes.push(c.code);
  });
  return {
    stops: codes, layovers: layovers, carriers: carriers(card), selfTransfer: selfTransfer,
    origin: r.origin || undefined, dest: r.destination || undefined, naStops: naStops, connections: conns,
  };
}

function signature(card: Card): string | null {
  if (!card.origin || !card.dest) return null;
  var set: Record<string, boolean> = {};
  (card.stops || []).forEach(function (s) { set[s] = true; });
  (card.connections || []).forEach(function (c) { set[c.code] = true; });
  var hubs = Object.keys(set).sort();
  if (!hubs.length) return null;
  var carrier = (card.carriers || []).map(function (c) { return c.toLowerCase(); }).sort().join(",");
  var legs = (card.connections || []).map(function (c) { return c.code + ":" + c.min; }).sort().join(",");
  return card.origin + ">" + card.dest + "|" + hubs.join(",") + "|" + carrier + "|" + legs;
}

function findSelected(): HTMLElement[] {
  if (!document.querySelector('[class*="ehQI-provider-container"]')) return [];
  var right = document.querySelector('[class*="MZCS-right-container"]') as HTMLElement | null;
  return right ? [right] : [];
}

function searchCabin(): Cabin | null {
  var m = location.pathname.match(/\/(premium|business|first)(?:\/|$)/);
  return m ? cabinFromLabel(m[1]) : "economy";
}

function stylePill(pill: HTMLElement): void {
  var c = badge.toneColors("amber", badge.pageDark());
  pill.style.cssText = "display:inline-flex;align-items:center;margin-left:6px;" +
    "color:" + c.fg + ";background:" + c.bg + ";border-radius:4px;padding:1px 6px;" +
    "font-size:11px;font-weight:700;line-height:16px;white-space:nowrap";
}

function legFor(min: number | null | undefined, code: string | null | undefined): HTMLElement | null {
  var right = document.querySelector('[class*="MZCS-right-container"]') as HTMLElement | null;
  if (!right || !code) return null;
  var legs = right.querySelectorAll('[class*="E69K-leg-wrapper"]');
  if (legs.length < 2) return null;
  var re;
  if (min != null && min > 0) {
    var h = Math.floor(min / 60), m = min % 60;
    var dur = h > 0 ? h + "h\\s*0?" + m + "m" : "(?:0h\\s*)?0?" + m + "m";
    re = new RegExp(dur + "[^)]{0,80}\\(" + code + "\\)");
  } else {
    re = new RegExp("\\(" + code + "\\)");
  }
  var hit: HTMLElement | null = null;
  for (var i = 0; i < legs.length; i++) {
    var t = ((legs[i] as HTMLElement).innerText || "").replace(/\s+/g, " ");
    if (re.test(t)) {
      if (hit) return null;
      hit = legs[i] as HTMLElement;
    }
  }
  return hit;
}

function insertBanner(pill: HTMLElement, legEl?: HTMLElement | null): void {
  var right = document.querySelector('[class*="MZCS-right-container"]') as HTMLElement | null;
  if (!right || right.querySelector("[data-getstopover-banner]")) return;
  var wrap = document.createElement("div");
  wrap.setAttribute("data-getstopover-banner", "1");
  wrap.appendChild(pill);
  if (legEl) {
    wrap.style.cssText = "margin:10px 0";
    var head = legEl.firstElementChild as HTMLElement | null;
    if (head) head.insertAdjacentElement("afterend", wrap);
    else legEl.insertAdjacentElement("afterbegin", wrap);
    try {
      if (head) {
        var probe = (head.querySelector("img") || head.firstElementChild || head) as HTMLElement;
        var delta = Math.round(probe.getBoundingClientRect().left - wrap.getBoundingClientRect().left);
        if (delta > 0 && delta < 80) {
          wrap.style.marginLeft = delta + "px";
          wrap.style.marginRight = delta + "px";
        }
      }
    } catch (e) { /* ignore */ }
    return;
  }
  var leg = right.querySelector('[class*="E69K-leg-wrapper"]') as HTMLElement | null;
  if (!leg) { wrap.remove(); return; }
  wrap.style.cssText = "margin:0 0 10px 0";
  leg.insertAdjacentElement("beforebegin", wrap);
}

function markBookingWarning(kind: "risk" | "bags" | "fit", data: RiskVerdict | BagVerdict | FitVerdict): void {
  var legEl: HTMLElement | null = null;
  if (kind === "fit") {
    var fv = data as FitVerdict;
    legEl = legFor(fv.layoverMin, fv.airport);
  } else if (kind === "risk") {
    var rv = data as RiskVerdict;
    if (!(rv.hubCount && rv.hubCount > 1)) legEl = legFor(rv.layoverMin != null ? rv.layoverMin : null, rv.airport);
  } else {
    var bv = data as BagVerdict;
    if (bv.kind === "customs") legEl = legFor(bv.layoverMin != null ? bv.layoverMin : null, bv.hub);
  }
  insertBanner(badge.buildWarnPill(kind, data, "8px", badge.pageDark()), legEl);
}

function markBooking(v: Verdict): void {
  var both = v.legStops && v.legStops.length >= 2;
  insertBanner(badge.buildPill(v, "8px", badge.pageDark()), both ? null : legFor(v.layoverMin, v.airport));
  var rows = document.querySelectorAll('[class*="ehQI-provider-container"]');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i] as HTMLElement;
    if (row.querySelector("[data-getstopover-bookmark]")) continue;
    var tags = row.querySelectorAll('[class*="AFFP-label"]'), airlineTag: HTMLElement | null = null;
    for (var t = 0; t < tags.length; t++) {
      if ((tags[t].textContent || "").trim() === "Airline") { airlineTag = tags[t] as HTMLElement; break; }
    }
    if (!airlineTag) continue;
    var pill = document.createElement("span");
    pill.setAttribute("data-getstopover-bookmark", "1");
    pill.textContent = "Stopover";
    stylePill(pill);
    var wrapper = airlineTag.closest('[class*="iFQ8-custom-badge-wrapper"]') as HTMLElement | null;
    if (wrapper) {
      wrapper.style.display = "inline-flex";
      wrapper.style.alignItems = "center";
      wrapper.appendChild(pill);
    } else {
      airlineTag.insertAdjacentElement("afterend", pill);
    }
  }
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
  searchCabin: searchCabin,
  signature: signature,
  findSelected: findSelected,
  markBooking: markBooking,
  markBookingWarning: markBookingWarning,
  skipSelectedChip: true,
});
