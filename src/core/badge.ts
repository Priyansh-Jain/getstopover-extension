/*
 * GetStopover — traffic-light chip renderer (site-agnostic).
 *
 * Stamps a compact green / amber / grey chip onto a flight-result card.
 * Clicking it opens the collapsible detail panel — the chip itself
 * stays lean (city + one hook); the full breakdown lives in the panel.
 *   green = confirmed (carrier-agnostic programme, layover fits)
 *   amber = likely, but verify your fare class / ticket
 *   grey  = a programme exists here, but this itinerary couldn't be verified
 */
import type { BagVerdict, FitVerdict, RiskVerdict, Verdict } from "../types";
import { panel } from "./panel";

const ATTR = "data-getstopover-badge";
const TONE_ATTR = "data-gs-tone";
type Tone = "green" | "amber" | "grey" | "red";
const TONE: Record<Tone, { lightFg: string; lightBg: string; dark: string }> = {
  green: { lightFg: "#0d652d", lightBg: "#e6f4ea", dark: "#86efac" },
  amber: { lightFg: "#92400e", lightBg: "#fef3c7", dark: "#fcd34d" },
  grey: { lightFg: "#334155", lightBg: "#f1f5f9", dark: "#cbd5e1" },
  red: { lightFg: "#b91c1c", lightBg: "#fee2e2", dark: "#fca5a5" },
};
const INLINE_H = 28;

function fmtHm(min: number): string {
  var h = Math.floor(min / 60), m = min % 60;
  return h ? (h + "h" + (m ? " " + m + "m" : "")) : (m + "m");
}

function label(v: Verdict): string {
  if (v.selfTransfer) return "⚠ " + v.city + " stopover needs one ticket";
  if (v.confidence === "grey") return "✈ " + v.city + " stopover?";
  return "✈ " + v.city + " stopover";
}

// One short hook only; everything else moves to the panel.
function hook(v: Verdict): string {
  if (v.selfTransfer) return "";
  var twoLegs = !!(v.legStops && v.legStops.length >= 2);
  var lead = twoLegs ? (v.oncePerTrip ? "Either leg · " : "Both legs · ") : "";
  if (v.hotelModel === "free" && v.hotelValueUSD) return lead + "Up to $" + v.hotelValueUSD + " free hotel";
  if (v.freeTours) return lead + "Free city tour";
  if (v.hotelModel === "no-airfare-only") return lead + "Free stopover";
  return twoLegs ? (v.oncePerTrip ? "Either leg" : "Both legs") : "";
}

function paintPill(pill: HTMLElement, dark: boolean): void {
  var tone = (pill.getAttribute(TONE_ATTR) as Tone) || "grey";
  var pair = TONE[tone] || TONE.grey;
  var fg = dark ? pair.dark : pair.lightFg;
  pill.style.background = dark ? hexToRgba(pair.dark, 0.24) : pair.lightBg;
  var spans = pill.getElementsByTagName("span");
  for (var i = 0; i < spans.length; i++) spans[i].style.color = fg;
}

var chipTip: HTMLElement | null = null;
var chipTipTimer: ReturnType<typeof setTimeout> | null = null;

function ensureChipTip(): HTMLElement {
  if (chipTip && document.body && document.body.contains(chipTip)) return chipTip;
  chipTip = document.createElement("div");
  chipTip.setAttribute("data-getstopover-tip", "1");
  chipTip.style.cssText = [
    "position:fixed", "z-index:2147483647", "max-width:280px", "pointer-events:none",
    "font:12px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
    "padding:9px 12px", "border-radius:8px", "white-space:nowrap",
    "visibility:hidden", "opacity:0", "transition:opacity .1s"
  ].join(";");
  document.body.appendChild(chipTip);
  return chipTip;
}

function showChipTip(anchor: HTMLElement, text: string): void {
  var tip = ensureChipTip();
  var dark = pageDark();
  tip.textContent = text;
  tip.style.background = dark ? "#3c4043" : "#fff";
  tip.style.color = dark ? "#e8eaed" : "#202124";
  tip.style.boxShadow = dark
    ? "0 2px 10px rgba(0,0,0,.5),0 1px 3px rgba(0,0,0,.4)"
    : "0 2px 8px rgba(60,64,67,.2),0 1px 3px rgba(60,64,67,.25)";
  var r = anchor.getBoundingClientRect();
  tip.style.left = "auto";
  tip.style.right = Math.max(8, window.innerWidth - r.right) + "px";
  if (r.top > 64) {
    tip.style.top = "auto";
    tip.style.bottom = (window.innerHeight - r.top + 6) + "px";
  } else {
    tip.style.bottom = "auto";
    tip.style.top = (r.bottom + 6) + "px";
  }
  tip.style.visibility = "visible";
  tip.style.opacity = "1";
}

function hideChipTip(): void {
  if (chipTipTimer) { clearTimeout(chipTipTimer); chipTipTimer = null; }
  if (chipTip) { chipTip.style.visibility = "hidden"; chipTip.style.opacity = "0"; }
}

function tonalPill(
  tone: Tone, head: string, tail: string, radius: string, dark: boolean,
  title: string, onClick: () => void
): HTMLElement {
  var pill = document.createElement("div");
  pill.setAttribute(TONE_ATTR, tone);
  pill.style.cssText = [
    "display:inline-flex", "align-items:center", "gap:6px", "cursor:pointer",
    "border-radius:" + radius, "padding:4px 10px",
    "font:12px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
    "white-space:nowrap", "max-width:100%", "overflow:hidden"
  ].join(";");
  var h = document.createElement("span");
  h.textContent = head;
  h.style.cssText = "font-weight:700;flex:0 0 auto";
  pill.appendChild(h);
  if (tail) {
    var t = document.createElement("span");
    t.textContent = tail;
    t.style.cssText = "font-weight:400;overflow:hidden;text-overflow:ellipsis";
    pill.appendChild(t);
  }
  paintPill(pill, dark);
  pill.addEventListener("mouseenter", function () {
    if (chipTipTimer) clearTimeout(chipTipTimer);
    chipTipTimer = setTimeout(function () { showChipTip(pill, title); }, 120);
  });
  pill.addEventListener("mouseleave", hideChipTip);
  pill.addEventListener("click", function (ev) { ev.stopPropagation(); ev.preventDefault(); hideChipTip(); onClick(); });
  return pill;
}

function prepAnchor(cardEl: HTMLElement, appendInline?: boolean, inline?: boolean): void {
  if (appendInline) return;
  try {
    var cs = getComputedStyle(cardEl);
    if (cs.position === "static") cardEl.style.position = "relative";
  } catch (e) { /* ignore */ }
  if (inline) cardEl.style.paddingTop = INLINE_H + "px";
}

function wrapEl(attrVal: string, appendInline?: boolean, pos?: "top" | "bottom", inline?: boolean): HTMLElement {
  var wrap = document.createElement("div");
  wrap.setAttribute(ATTR, attrVal);
  if (appendInline) {
    wrap.style.cssText = "display:inline-flex;align-items:center;gap:6px;margin-left:8px;vertical-align:middle;flex:1 1 0;min-width:0";
  } else {
    wrap.style.cssText = [
      "position:absolute",
      (inline ? "top:4px" : pos === "bottom" ? "bottom:8px" : "top:8px"),
      "left:8px", "z-index:2", "display:flex", "flex-wrap:wrap", "gap:6px", "align-items:center",
      "max-width:calc(100% - 16px)"
    ].join(";");
  }
  return wrap;
}

function logoLeft(container: HTMLElement, skip?: HTMLElement): number | null {
  try {
    var cr = container.getBoundingClientRect();
    if (!cr.width) return null;
    var els = container.querySelectorAll("img, div, span");
    for (var i = 0; i < els.length && i < 500; i++) {
      var el = els[i] as HTMLElement;
      if (skip && (el === skip || skip.contains(el))) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 20 || r.width > 80 || r.height < 20 || r.height > 80) continue;
      if (r.left - cr.left > cr.width * 0.25) continue;
      return r.left;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function alignToLogo(cardEl: HTMLElement, wrap: HTMLElement): void {
  var l = logoLeft(cardEl, wrap);
  if (l == null) return;
  try {
    var delta = Math.round(l - wrap.getBoundingClientRect().left);
    if (delta > 0 && delta < 160) wrap.style.left = (8 + delta) + "px";
  } catch (e) { /* ignore */ }
}

function stampWarning(cardEl: HTMLElement, attrVal: string, pill: HTMLElement, pos?: "top" | "bottom", inline?: boolean, appendInline?: boolean, alignImg?: boolean): void {
  if (cardEl.querySelector("[" + ATTR + "]")) return;
  prepAnchor(cardEl, appendInline, inline);
  var wrap = wrapEl(attrVal, appendInline, pos, inline);
  wrap.appendChild(pill);
  cardEl.appendChild(wrap);
  if (alignImg && !appendInline) alignToLogo(cardEl, wrap);
}

function buildWarnPill(
  kind: "risk" | "bags" | "fit", data: RiskVerdict | BagVerdict | FitVerdict,
  radius: string, dark: boolean
): HTMLElement {
  if (kind === "risk") {
    var rv = data as RiskVerdict;
    var rTail = rv.tightNote ? rv.tightNote
      : rv.layoverMin != null ? "only " + fmtHm(rv.layoverMin) + " here, very tight"
      : "clear immigration + re-check bags";
    var rHead = "⚠ " + (rv.stopsLabel || (rv.city + (rv.country === "US" ? ", US border stop" : ", Canada border stop")));
    return tonalPill("red", rHead, rTail, radius, dark, "Click for transit details",
      function () { panel.showRisk(rv); });
  }
  if (kind === "fit") {
    var fv = data as FitVerdict;
    var fTail = fv.selfTransfer ? "self-transfer, very tight"
      : fv.severity === "red" ? "may be too short" : "tight connection";
    var fHead = "⚠ " + fmtHm(fv.layoverMin) + " at " + fv.airport + ":";
    return tonalPill(fv.severity === "red" ? "red" : "amber", fHead, fTail, radius, dark,
      "Click for connection details", function () { panel.showFit(fv); });
  }
  var bv = data as BagVerdict;
  var bHead, bTail;
  if (bv.kind === "customs") {
    bHead = "🧳 Re-check bags at " + bv.hub + ",";
    bTail = (bv.country === "US" ? "US" : "Canada") + " customs";
  } else if (bv.layoverMin != null && bv.tight) {
    bHead = "🧳 Separate tickets, " + fmtHm(bv.layoverMin);
    bTail = "collect & re-check, tight";
  } else {
    bHead = "🧳 Separate tickets";
    bTail = "collect & re-check your bags";
  }
  var bRed = bv.kind === "customs" || bv.tight;
  return tonalPill(bRed ? "red" : "amber", bHead, bTail, radius, dark,
    "Click for baggage details", function () { panel.showBags(bv); });
}

function cardRadius(cardEl: HTMLElement): string {
  var el: HTMLElement | null = cardEl, up = 0;
  while (el && up < 4) {
    try { var r = getComputedStyle(el).borderTopLeftRadius; if (r && r !== "0px") return r; } catch (e) { /* ignore */ }
    el = el.parentElement; up++;
  }
  return "8px";
}

function hexToRgba(hex: string, a: number): string {
  var n = parseInt(hex.slice(1), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

function lum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function chipDark(cardEl: HTMLElement): boolean {
  var el: HTMLElement | null = cardEl;
  while (el) {
    try {
      var bg = getComputedStyle(el).backgroundColor;
      var m = bg.match(/(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
      if (m && (m[4] === undefined || +m[4] >= 0.5)) return lum(+m[1], +m[2], +m[3]) < 128;
    } catch (e) { /* ignore */ }
    el = el.parentElement;
  }
  try {
    var tc = getComputedStyle(document.body).color;
    var tm = tc.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (tm) return lum(+tm[1], +tm[2], +tm[3]) >= 128;
  } catch (e) { /* ignore */ }
  return false;
}

function buildPill(v: Verdict, radius: string, dark: boolean): HTMLElement {
  return tonalPill(v.confidence, label(v), hook(v), radius, dark,
    "Click for stopover details", function () { panel.show(v); });
}

// Compact single-word chip (e.g. "Stopover") for placing beside an existing
// site tag, such as Skyscanner's booking-page provider "Airline" badge.
function stopoverTag(v: Verdict, dark: boolean): HTMLElement {
  var wrap = document.createElement("span");
  wrap.setAttribute(ATTR, v.confidence);
  wrap.style.cssText = "display:inline-flex;vertical-align:middle";
  wrap.appendChild(tonalPill(v.confidence, "Stopover", "", "4px", dark,
    "Click for stopover details", function () { panel.show(v); }));
  return wrap;
}

function addBadge(cardEl: HTMLElement, v: Verdict, pos?: "top" | "bottom", inline?: boolean, appendInline?: boolean, alignImg?: boolean): void {
  if (cardEl.querySelector("[" + ATTR + "]")) return;
  prepAnchor(cardEl, appendInline, inline);
  var wrap = wrapEl(v.confidence, appendInline, pos, inline);
  var radius = cardRadius(cardEl);
  var dark = chipDark(cardEl);
  var verdicts = [v].concat(v.otherVerdicts || []);
  verdicts.forEach(function (vd) { wrap.appendChild(buildPill(vd, radius, dark)); });
  cardEl.appendChild(wrap);
  if (alignImg && !appendInline) alignToLogo(cardEl, wrap);
}

function addRiskBadge(cardEl: HTMLElement, rv: RiskVerdict, pos?: "top" | "bottom", inline?: boolean, appendInline?: boolean, alignImg?: boolean): void {
  stampWarning(cardEl, "risk", buildWarnPill("risk", rv, cardRadius(cardEl), chipDark(cardEl)), pos, inline, appendInline, alignImg);
}

function addFitBadge(cardEl: HTMLElement, fv: FitVerdict, pos?: "top" | "bottom", inline?: boolean, appendInline?: boolean, alignImg?: boolean): void {
  stampWarning(cardEl, "fit", buildWarnPill("fit", fv, cardRadius(cardEl), chipDark(cardEl)), pos, inline, appendInline, alignImg);
}

function addBagBadge(cardEl: HTMLElement, bv: BagVerdict, pos?: "top" | "bottom", inline?: boolean, appendInline?: boolean, alignImg?: boolean): void {
  stampWarning(cardEl, "bags", buildWarnPill("bags", bv, cardRadius(cardEl), chipDark(cardEl)), pos, inline, appendInline, alignImg);
}

function pageDark(): boolean {
  return chipDark(document.body);
}

function toneColors(tone: Tone, dark: boolean): { fg: string; bg: string } {
  var pair = TONE[tone] || TONE.grey;
  return dark ? { fg: pair.dark, bg: hexToRgba(pair.dark, 0.24) } : { fg: pair.lightFg, bg: pair.lightBg };
}

function repaintAll(dark: boolean): void {
  var pills = document.querySelectorAll("[" + TONE_ATTR + "]");
  for (var i = 0; i < pills.length; i++) paintPill(pills[i] as HTMLElement, dark);
}

export const badge = { addBadge: addBadge, addRiskBadge: addRiskBadge, addFitBadge: addFitBadge, addBagBadge: addBagBadge, pageDark: pageDark, repaintAll: repaintAll, buildPill: buildPill, buildWarnPill: buildWarnPill, toneColors: toneColors, logoLeft: logoLeft, stopoverTag: stopoverTag };
