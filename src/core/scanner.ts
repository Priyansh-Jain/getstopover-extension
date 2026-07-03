/*
 * GetStopover — generic orchestrator.
 *
 * Picks whichever site adapter matches the current page (Skyscanner / Google
 * Flights / Kayak), then scans result cards, runs each through the shared engine,
 * and stamps a traffic-light badge on matches. Re-scans on DOM mutations (all
 * three sites are single-page apps that stream results in) with a debounce, plus
 * a slow safety interval.
 */
import type { Adapter, BagVerdict, Cabin, Card, Confidence, FitVerdict, RiskVerdict, Verdict } from "../types";
import { engine } from "./engine";
import { risk } from "./risk";
import { bags } from "./bags";
import { fit } from "./fit";
import { badge } from "./badge";

const adapters: Adapter[] = [];

export function registerAdapter(a: Adapter): void {
  adapters.push(a);
}

function activeAdapter(): Adapter | null {
  for (var i = 0; i < adapters.length; i++) {
    try { if (adapters[i].matches()) return adapters[i]; } catch (e) { /* ignore */ }
  }
  return null;
}

// --- adapter-rot self-check -------------------------------------------------
// A known results page that still shows 0 cards well after load almost always
// means the host site renamed its DOM/classes (Skyscanner/Kayak class hashes,
// Google's obfuscated names rot constantly). Without this, the product silently
// shows nothing. We try a broad union selector as a best-effort fallback and
// warn once per page so the rot is visible instead of failing silently.
const ROT_GRACE_MS = 6000; // give results time to stream in before crying rot
const ROT_MIN_BROAD = 4;   // need a few candidate rows to call it rot, not loading
const BROAD_SELECTOR =
  '[data-testid="ticket"], [class*="FlightsTicket"], [class*="Ticket"], [class*="FlightCard"], [class*="Itinerary"],' +
  'li.pIav2d, ul.Rk10dc > li,' +
  '[data-resultid], [class*="nrc6"], [class*="resultInner"], [class*="result-item"]';

var DEBUG = false;
var lastUrl = "";
var urlSince = 0;
var rotFlagged = false;
var lastDark = false;
var cabinCache: { href: string; val: Cabin } | null = null;

function searchedCabin(ad: Adapter): Cabin | null {
  if (!ad.searchCabin) return null;
  if (cabinCache && cabinCache.href === location.href) return cabinCache.val;
  var val: Cabin | null = null;
  try { val = ad.searchCabin(); } catch (e) { val = null; }
  if (val) cabinCache = { href: location.href, val: val };
  return val;
}

function broadCards(): HTMLElement[] {
  try { return Array.prototype.slice.call(document.querySelectorAll(BROAD_SELECTOR)) as HTMLElement[]; }
  catch (e) { return []; }
}

// Some sites (Kayak especially) match the same flight at several nested DOM
// levels, which would stamp a chip on each. Keep only the outermost element
// per flight so each card gets exactly one badge.
function dedupeNested(cards: HTMLElement[]): HTMLElement[] {
  var set = new Set(cards);
  return cards.filter(function (c) {
    var p = c.parentElement;
    while (p) { if (set.has(p)) return false; p = p.parentElement; }
    return true;
  });
}

type StampKind = "verdict" | "risk" | "bags" | "fit";
interface Keeper {
  card: HTMLElement;
  kind: StampKind;
  data: Verdict | RiskVerdict | BagVerdict | FitVerdict;
}
var keepers: Keeper[] = [];

function remember(card: HTMLElement, kind: StampKind, data: Verdict | RiskVerdict | BagVerdict | FitVerdict): void {
  for (var i = 0; i < keepers.length; i++) {
    if (keepers[i].card === card) { keepers[i].kind = kind; keepers[i].data = data; return; }
  }
  keepers.push({ card: card, kind: kind, data: data });
}

var memory: Record<string, { kind: StampKind; data: Verdict | RiskVerdict | BagVerdict | FitVerdict }> = {};

function applyStamp(anchor: HTMLElement, kind: StampKind, data: Verdict | RiskVerdict | BagVerdict | FitVerdict, ad: Adapter): void {
  var ai = ad.badgeAppendInline;
  var al = ad.badgeAlignImg;
  if (kind === "verdict") badge.addBadge(anchor, data as Verdict, ad.badgePos, ad.badgeInline, ai, al);
  else if (kind === "risk") badge.addRiskBadge(anchor, data as RiskVerdict, ad.badgePos, ad.badgeInline, ai, al);
  else if (kind === "bags") badge.addBagBadge(anchor, data as BagVerdict, ad.badgePos, ad.badgeInline, ai, al);
  else if (kind === "fit") badge.addFitBadge(anchor, data as FitVerdict, ad.badgePos, ad.badgeInline, ai, al);
}

function clearHiddenBadges(el: HTMLElement): boolean {
  var bs = el.querySelectorAll("[data-getstopover-badge]");
  var visible = false;
  for (var i = 0; i < bs.length; i++) {
    var b = bs[i] as HTMLElement;
    if (b.getClientRects().length > 0) visible = true; else b.remove();
  }
  return visible;
}

function record(card: HTMLElement, anchor: HTMLElement, kind: StampKind, data: Verdict | RiskVerdict | BagVerdict | FitVerdict, parsed: Card, ad: Adapter): void {
  applyStamp(anchor, kind, data, ad);
  remember(card, kind, data);
  if (ad.signature) { var sg = ad.signature(parsed); if (sg) memory[sg] = { kind: kind, data: data }; }
}

function reStamp(ad: Adapter): void {
  for (var i = keepers.length - 1; i >= 0; i--) {
    var k = keepers[i];
    if (!document.contains(k.card)) { keepers.splice(i, 1); continue; }
    var anchor = ad.badgeAnchor ? (ad.badgeAnchor(k.card) || k.card) : k.card;
    if (clearHiddenBadges(anchor)) continue;
    applyStamp(anchor, k.kind, k.data, ad);
  }
}

function scan(): void {
  var ad = activeAdapter();
  if (!ad) return;

  // Reset the per-page rot guard whenever the SPA navigates.
  if (location.href !== lastUrl) { lastUrl = location.href; urlSince = Date.now(); rotFlagged = false; }

  var cards: HTMLElement[] = [];
  try { cards = ad.findCards(); } catch (e) { cards = []; }

  var rot = false;
  var rotAllowed = !(ad.skipRot && ad.skipRot());
  if (rotAllowed && cards.length === 0 && Date.now() - urlSince > ROT_GRACE_MS) {
    var broad = broadCards();
    if (broad.length >= ROT_MIN_BROAD) {
      cards = broad; // best-effort: parseCard skips anything that isn't a real card
      rot = true;
      if (!rotFlagged) {
        rotFlagged = true;
        console.warn("[GetStopover] adapter-rot (" + ad.id + "): its selectors found 0 result cards, but a " +
          "broad scan sees " + broad.length + " — the host site's DOM/classes likely changed. Using a best-effort " +
          "fallback; the " + ad.id + " adapter selectors need updating.");
      }
    }
  }

  cards = dedupeNested(cards);
  cards = cards.filter(function (c) { return c.getClientRects().length > 0; });

  var cabin = searchedCabin(ad);

  var counts: Record<Confidence, number> = { green: 0, amber: 0, grey: 0 };
  var badged = 0, risks = 0, bagN = 0, fits = 0;
  for (var i = 0; i < cards.length; i++) {
    try {
      var anchor = ad.badgeAnchor ? (ad.badgeAnchor(cards[i]) || cards[i]) : cards[i];
      if (anchor.querySelector("[data-getstopover-badge]")) continue;
      var parsed = ad.parseCard(cards[i]);
      if (!parsed) continue;
      var v = engine.evaluateCard(parsed, cabin);
      if (v) {
        record(cards[i], anchor, "verdict", v, parsed, ad);
        counts[v.confidence]++;
        badged++;
      } else {
        var rv = risk.evaluate(parsed);
        var bv = rv ? null : bags.evaluate(parsed);
        var fv = rv || bv ? null : fit.evaluate(parsed);
        if (rv) { record(cards[i], anchor, "risk", rv, parsed, ad); risks++; }
        else if (bv) { record(cards[i], anchor, "bags", bv, parsed, ad); bagN++; }
        else if (fv) { record(cards[i], anchor, "fit", fv, parsed, ad); fits++; }
      }
    } catch (e) { /* skip this card */ }
  }

  var findSel = ad.findSelected, sigFn = ad.signature;
  if (findSel && sigFn) {
    var sel: HTMLElement[] = [];
    try { sel = findSel(); } catch (e) { sel = []; }
    for (var s2 = 0; s2 < sel.length; s2++) {
      try {
        var selCard = sel[s2];
        var hasChip = clearHiddenBadges(selCard);
        var selParsed = ad.parseCard(selCard);
        if (!selParsed) continue;
        var sig = sigFn(selParsed);
        var mem = sig ? memory[sig] : null;
        var verdict: Verdict | null = null;
        var warn: { kind: "risk" | "bags" | "fit"; data: RiskVerdict | BagVerdict | FitVerdict } | null = null;
        if (mem) {
          if (mem.kind === "verdict") verdict = mem.data as Verdict;
          else warn = { kind: mem.kind, data: mem.data as RiskVerdict | BagVerdict | FitVerdict };
        } else {
          var sv = engine.evaluateCard(selParsed, searchedCabin(ad));
          if (sv) { if (sig) memory[sig] = { kind: "verdict", data: sv }; verdict = sv; }
          else {
            var srv = risk.evaluate(selParsed);
            var sbv = srv ? null : bags.evaluate(selParsed);
            var sfv = srv || sbv ? null : fit.evaluate(selParsed);
            if (srv) warn = { kind: "risk", data: srv };
            else if (sbv) warn = { kind: "bags", data: sbv };
            else if (sfv) warn = { kind: "fit", data: sfv };
            if (warn && sig) memory[sig] = { kind: warn.kind, data: warn.data };
          }
        }
        if (!hasChip && !ad.skipSelectedChip) {
          var selAnchor = ad.badgeAnchor ? (ad.badgeAnchor(selCard) || selCard) : selCard;
          if (verdict) applyStamp(selAnchor, "verdict", verdict, ad);
          else if (warn) applyStamp(selAnchor, warn.kind, warn.data, ad);
        }
        if (verdict && verdict.confidence === "amber" && ad.markBooking) ad.markBooking(verdict, selCard);
        else if (warn && ad.markBookingWarning) ad.markBookingWarning(warn.kind, warn.data, selCard);
      } catch (e) { /* skip */ }
    }
  }

  if (DEBUG) console.log("[GetStopover](" + ad.id + ") cards: " + cards.length + " | badged: " + badged +
    " (green " + counts.green + ", amber " + counts.amber + ", grey " + counts.grey + ")" +
    " | transit: " + risks + " | bags: " + bagN + " | fit: " + fits + (rot ? " [ROT-FALLBACK]" : ""));
}

function clearBadges(): void {
  var old = document.querySelectorAll("[data-getstopover-badge]");
  for (var i = 0; i < old.length; i++) old[i].remove();
}

// Re-render all chips (used when a setting changes, e.g. the buffer toggle).
export function rescan(): void {
  keepers = [];
  clearBadges();
  scan();
}

var debTimer: ReturnType<typeof setTimeout> | null = null;
var maxTimer: ReturnType<typeof setTimeout> | null = null;
function runScan(): void {
  if (debTimer) { clearTimeout(debTimer); debTimer = null; }
  if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
  scan();
}
function schedule(): void {
  if (debTimer) clearTimeout(debTimer);
  debTimer = setTimeout(runScan, 300);
  if (!maxTimer) maxTimer = setTimeout(runScan, 2500);
}

function themeTick(): void {
  try {
    var d = badge.pageDark();
    if (d !== lastDark) { lastDark = d; badge.repaintAll(d); }
  } catch (e) { /* ignore */ }
}

export function startScanner(): void {
  try { lastDark = badge.pageDark(); } catch (e) { /* ignore */ }
  try {
    new MutationObserver(function () {
      var ad = activeAdapter();
      if (ad) reStamp(ad);
      themeTick();
      schedule();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* ignore */ }
  try {
    var themeObs = new MutationObserver(themeTick);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    if (document.body) themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
  } catch (e) { /* ignore */ }
  setInterval(themeTick, 1000);
  setInterval(schedule, 3000);
  schedule();
}
