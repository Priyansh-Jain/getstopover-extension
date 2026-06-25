/*
 * GetStopover — generic orchestrator.
 *
 * Picks whichever site adapter matches the current page (Skyscanner / Google
 * Flights / Kayak), then scans result cards, runs each through the shared engine,
 * and stamps a traffic-light badge on matches. Re-scans on DOM mutations (all
 * three sites are single-page apps that stream results in) with a debounce, plus
 * a slow safety interval.
 */
import type { Adapter, Confidence } from "../types";
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

function scan(): void {
  var ad = activeAdapter();
  if (!ad) return;

  // Reset the per-page rot guard whenever the SPA navigates.
  if (location.href !== lastUrl) { lastUrl = location.href; urlSince = Date.now(); rotFlagged = false; }

  var cards: HTMLElement[] = [];
  try { cards = ad.findCards(); } catch (e) { cards = []; }

  var rot = false;
  if (cards.length === 0 && Date.now() - urlSince > ROT_GRACE_MS) {
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

  var counts: Record<Confidence, number> = { green: 0, amber: 0, grey: 0 };
  var badged = 0, risks = 0, bagN = 0, fits = 0;
  for (var i = 0; i < cards.length; i++) {
    try {
      var anchor = ad.badgeAnchor ? (ad.badgeAnchor(cards[i]) || cards[i]) : cards[i];
      if (anchor.querySelector("[data-getstopover-badge]")) continue;
      var parsed = ad.parseCard(cards[i]);
      if (!parsed) continue;
      var v = engine.evaluateCard(parsed);
      if (v) {
        badge.addBadge(anchor, v, ad.badgePos, ad.badgeInline);
        counts[v.confidence]++;
        badged++;
      } else {
        var rv = risk.evaluate(parsed);
        var bv = rv ? null : bags.evaluate(parsed);
        var fv = rv || bv ? null : fit.evaluate(parsed);
        if (rv) { badge.addRiskBadge(anchor, rv, ad.badgePos, ad.badgeInline); risks++; }
        else if (bv) { badge.addBagBadge(anchor, bv, ad.badgePos, ad.badgeInline); bagN++; }
        else if (fv) { badge.addFitBadge(anchor, fv, ad.badgePos, ad.badgeInline); fits++; }
      }
    } catch (e) { /* skip this card */ }
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

export function startScanner(): void {
  try {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* ignore */ }
  setInterval(schedule, 3000);
  schedule();
}
