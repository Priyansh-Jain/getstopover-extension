/*
 * GetStopover — Google Flights site adapter.
 *
 * Google Flights shows each connection as "<X> hr <Y> min <CODE>" in the result
 * row (e.g. "10 hr 55 min DOH"), and usually also describes it in the row's
 * aria-label ("...Layover (10 hr 55 min) in Doha..."). We read BOTH:
 *   - the visible row text is the reliable primary source for layover + code;
 *   - the aria-label is a fallback and the best source for the operating carrier.
 * A connection code is only accepted when it's a hub we have data for, and a
 * layover is only recorded when it sits immediately after a duration, so the
 * total trip duration is never mistaken for a layover. Fails SAFE to grey/no-badge.
 */
import type { Card } from "../types";
import { programs } from "../data/programs";
import { naStopsFromConns } from "../data/airports-na";
import { registerAdapter } from "../core/scanner";

var cityMap: Record<string, string> = {}; // lowercased city name -> hub code
var codeSet: Record<string, boolean> = {}; // hub code -> true
var airlines: { name: string; lc: string }[] = [];
programs.forEach(function (p) {
  cityMap[p.city.toLowerCase()] = p.airport;
  codeSet[p.airport] = true;
  airlines.push({ name: p.airline, lc: p.airline.toLowerCase() });
});

function findCards(): HTMLElement[] {
  var nodes = document.querySelectorAll('li.pIav2d, ul.Rk10dc > li, [role="listitem"]');
  var out: HTMLElement[] = [], seen: HTMLElement[] = [];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i] as HTMLElement;
    if (seen.indexOf(n) === -1) { seen.push(n); out.push(n); }
  }
  return out;
}

// Longest aria-label on or under the element (Google's full itinerary string).
function bestLabel(el: HTMLElement): string {
  var best = el.getAttribute("aria-label") || "";
  var nodes = el.querySelectorAll("[aria-label]");
  for (var i = 0; i < nodes.length; i++) {
    var l = nodes[i].getAttribute("aria-label") || "";
    if (l.length > best.length) best = l;
  }
  return best;
}

function addStop(out: Card, code: string | null, min: number | null): void {
  if (!code) return;
  if (out.stops.indexOf(code) === -1) out.stops.push(code);
  if (min != null && out.layovers[code] == null) out.layovers[code] = min;
}

function durFrom(seg: string): number | null {
  var d = seg.match(/(\d+)\s*(?:hr|hour)s?(?:\s*(\d+)\s*(?:min|minute)s?)?/i);
  return d ? parseInt(d[1], 10) * 60 + (d[2] ? parseInt(d[2], 10) : 0) : null;
}

function codeFromSeg(seg: string): string | null {
  var cm = seg.match(/\b[A-Z]{3}\b/);
  if (cm && codeSet[cm[0]]) return cm[0];
  var sl = seg.toLowerCase();
  for (var name in cityMap) if (sl.indexOf(name) !== -1) return cityMap[name];
  return null;
}

function parse(label: string, text: string): Card {
  var out: Card = { stops: [], layovers: {}, carriers: [] };
  label = label || "";
  text = text || "";

  // (A) Visible row text: "10 hr 55 min DOH" or a sub-hour "50 min DOH" — duration
  // immediately before the hub code. Total trip duration has no code after it, so it's never matched.
  var re = /(\d+\s*hrs?(?:\s*\d+\s*mins?)?|\d+\s*mins?)\s+([A-Z]{3})\b/g, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (!codeSet[m[2]]) continue;
    addStop(out, m[2], durMin(m[1]));
  }

  // (B) aria-label: text window after each "Layover" mention.
  var parts = label.split(/layover/i);
  for (var i = 1; i < parts.length; i++) {
    var seg = parts[i].slice(0, 90);
    addStop(out, codeFromSeg(seg), durFrom(seg));
  }

  // (C) Expanded view: "<dur> layover ... <hub>" — duration split from the code.
  var reC = /(\d+)\s*hrs?(?:\s*(\d+)\s*mins?)?\s+layover/gi, mc: RegExpExecArray | null;
  var hay = text + "\n" + label;
  while ((mc = reC.exec(hay))) {
    var win = hay.slice(mc.index, mc.index + 100);
    addStop(out, codeFromSeg(win), parseInt(mc[1], 10) * 60 + (mc[2] ? parseInt(mc[2], 10) : 0));
  }

  // Operating carrier(s): "...flight with British Airways and Qatar Airways..."
  // captured generically so a non-programme airline through a hub is read as
  // "wrong ticket" and suppressed, not left as an unknown-carrier amber.
  var cm2 = label.match(/flights?\s+with\s+([^.]+)/i);
  if (cm2) {
    cm2[1].split(/,| and | & /i).forEach(function (n) {
      n = n.trim();
      if (n && n.length > 1 && n.length < 40 && out.carriers.indexOf(n) === -1) out.carriers.push(n);
    });
  }
  // Fallback: any known programme airline named in the label or visible text.
  var low = (label + " " + text).toLowerCase();
  for (var a = 0; a < airlines.length; a++) {
    if (low.indexOf(airlines[a].lc) !== -1 && out.carriers.indexOf(airlines[a].name) === -1) {
      out.carriers.push(airlines[a].name);
    }
  }
  if (/self[\s-]?transfer|separate ticket/.test(low)) out.selfTransfer = true;
  return out;
}

function durMin(s: string): number {
  var h = s.match(/(\d+)\s*hr/), m = s.match(/(\d+)\s*min/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function connectionsFrom(text: string, label: string, origin: string | null, dest: string | null): { code: string; min: number }[] {
  var out: { code: string; min: number }[] = [], seen: Record<string, boolean> = {};
  function add(code: string | null, min: number): void {
    if (!code || seen[code] || code === origin || code === dest) return;
    seen[code] = true; out.push({ code: code, min: min });
  }
  // Multi-stop: the visible "N stops CODE1, CODE2" lists the hubs in itinerary order;
  // each layover's duration is in the aria-label, in the same order.
  var sm = text.match(/\b\d+\s+stops?\s+([A-Z]{3}(?:\s*,\s*[A-Z]{3})*)/);
  if (sm) {
    var durs: number[] = [];
    var reL = /Layover \(\d+ of \d+\) is an? (.+?) layover/gi, ml: RegExpExecArray | null;
    while ((ml = reL.exec(label))) durs.push(durMin(ml[1]));
    var list = sm[1].split(/\s*,\s*/);
    for (var i = 0; i < list.length; i++) add(list[i], durs[i] != null ? durs[i] : 0);
    return out;
  }
  // Single stop: "10 hr 55 min DOH" (collapsed) or "... layover ... (DOH)" (expanded).
  var reA = /(\d+\s*hrs?(?:\s*\d+\s*mins?)?|\d+\s*mins?)\s+([A-Z]{3})\b/g, m: RegExpExecArray | null;
  while ((m = reA.exec(text))) add(m[2], durMin(m[1]));
  var reC = /(\d+\s*hrs?(?:\s*\d+\s*mins?)?|\d+\s*mins?)\s+layover/gi, mc: RegExpExecArray | null;
  while ((mc = reC.exec(text))) {
    var win = text.slice(mc.index, mc.index + 120);
    var cm = win.match(/\(([A-Z]{3})\)|\b([A-Z]{3})\b/);
    add(cm ? (cm[1] || cm[2]) : null, durMin(mc[1]));
  }
  return out;
}

function parseCard(el: HTMLElement): Card | null {
  var text = el.innerText || el.textContent || "";
  if (/\bnon[\s-]?stop\b/i.test(text)) return null;
  var label = bestLabel(el);
  var parsed = parse(label, text);
  var rm = text.toUpperCase().match(/\b([A-Z]{3})[–-]([A-Z]{3})\b/);
  var origin = rm ? rm[1] : null, dest = rm ? rm[2] : null;
  if (!origin || !dest) {
    var paren = text.toUpperCase().match(/\(([A-Z]{3})\)/g) || [];
    var pf = paren[0], pl = paren[paren.length - 1];
    if (paren.length >= 2 && pf && pl) {
      if (!origin) origin = pf.slice(1, 4);
      if (!dest) dest = pl.slice(1, 4);
    }
  }
  parsed.origin = origin || undefined;
  parsed.dest = dest || undefined;
  parsed.connections = connectionsFrom(text, label, origin, dest);
  parsed.naStops = naStopsFromConns(parsed.connections);
  return (parsed.stops.length || parsed.naStops.length || parsed.connections.length) ? parsed : null;
}

registerAdapter({
  id: "google-flights",
  matches: function () {
    return location.hostname.indexOf("google.") !== -1 &&
      /\/(travel\/)?flights/.test(location.pathname);
  },
  findCards: findCards,
  parseCard: parseCard,
  badgeInline: true,
  badgeAnchor: function (cardEl) {
    var box = cardEl.firstElementChild;
    return (box && box.tagName === "DIV" ? box : cardEl) as HTMLElement;
  },
  _parse: parse, // exposed for unit testing
});
