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
import type { BagVerdict, Confidence, FitVerdict, RiskVerdict, Verdict } from "../types";
import { panel } from "./panel";

const ATTR = "data-getstopover-badge";
const COLORS: Record<Confidence, string> = { green: "#16a34a", amber: "#d97706", grey: "#64748b" };
const RISK_COLOR = "#dc2626";
const INLINE_H = 28;

function fmtHm(min: number): string {
  var h = Math.floor(min / 60), m = min % 60;
  return h ? (h + "h" + (m ? " " + m + "m" : "")) : (m + "m");
}

function label(v: Verdict): string {
  if (v.selfTransfer) return "⚠ " + v.city + " stopover needs one ticket";
  if (v.confidence === "green") return "✓ " + v.city + " stopover, you qualify";
  if (v.confidence === "amber") return "✈ " + v.city + " stopover possible";
  return "✈ " + v.city + " stopover?";
}

// One short hook only; everything else moves to the panel.
function hook(v: Verdict): string {
  if (v.selfTransfer) return "";
  if (v.hotelModel === "free" && v.hotelValueUSD) return "up to $" + v.hotelValueUSD + " free hotel";
  if (v.freeTours) return "free city tour";
  if (v.hotelModel === "no-airfare-only") return "free stopover";
  return "";
}

function renderChip(
  cardEl: HTMLElement, attrVal: string, color: string, text: string, title: string,
  onClick: () => void, pos?: "top" | "bottom", inline?: boolean
): void {
  if (cardEl.querySelector("[" + ATTR + "]")) return;
  try {
    if (getComputedStyle(cardEl).position === "static") cardEl.style.position = "relative";
  } catch (e) { /* ignore */ }
  if (inline) cardEl.style.paddingTop = INLINE_H + "px";

  var wrap = document.createElement("div");
  wrap.setAttribute(ATTR, attrVal);
  wrap.title = title;
  wrap.addEventListener("click", function (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    onClick();
  });

  wrap.style.cssText = [
    "position:absolute",
    (inline ? "top:4px" : pos === "bottom" ? "bottom:8px" : "top:8px"),
    "left:8px", "z-index:99999", "cursor:pointer", "max-width:calc(100% - 16px)"
  ].join(";");

  var pill = document.createElement("div");
  pill.textContent = text;
  pill.style.cssText = [
    "display:inline-block", "background:" + color, "color:#fff",
    "font:600 11px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
    "padding:4px 9px", "border-radius:999px", "white-space:nowrap",
    "box-shadow:0 2px 8px rgba(15,23,42,.25)", "letter-spacing:.2px",
    "max-width:100%", "overflow:hidden", "text-overflow:ellipsis"
  ].join(";");
  wrap.appendChild(pill);
  cardEl.appendChild(wrap);
}

function addBadge(cardEl: HTMLElement, v: Verdict, pos?: "top" | "bottom", inline?: boolean): void {
  var h = hook(v);
  var text = label(v) + (h ? " · " + h : "");
  renderChip(cardEl, v.confidence, COLORS[v.confidence], text, "Click for stopover details",
    function () { panel.show(v); }, pos, inline);
}

function addRiskBadge(cardEl: HTMLElement, rv: RiskVerdict, pos?: "top" | "bottom", inline?: boolean): void {
  var hook = rv.layoverMin != null
    ? " · only " + fmtHm(rv.layoverMin) + " here, very tight"
    : " · clear immigration + re-check bags";
  var text = "⚠ " + rv.city + (rv.country === "US" ? ", US border stop" : ", Canada border stop") + hook;
  renderChip(cardEl, "risk", RISK_COLOR, text, "Click for transit details",
    function () { panel.showRisk(rv); }, pos, inline);
}

function addFitBadge(cardEl: HTMLElement, fv: FitVerdict, pos?: "top" | "bottom", inline?: boolean): void {
  var color = fv.severity === "red" ? RISK_COLOR : COLORS.amber;
  var tail = fv.selfTransfer ? "self-transfer, very tight"
    : fv.severity === "red" ? "may be too short" : "tight connection";
  var text = "⚠ " + fmtHm(fv.layoverMin) + " at " + fv.airport + ": " + tail;
  renderChip(cardEl, "fit", color, text, "Click for connection details",
    function () { panel.showFit(fv); }, pos, inline);
}

function addBagBadge(cardEl: HTMLElement, bv: BagVerdict, pos?: "top" | "bottom", inline?: boolean): void {
  var red = bv.kind === "customs" || bv.tight;
  var color = red ? RISK_COLOR : COLORS.amber;
  var text;
  if (bv.kind === "customs") {
    text = "🧳 Re-check bags at " + bv.hub + ", " + (bv.country === "US" ? "US" : "Canada") + " customs";
  } else if (bv.layoverMin != null && bv.tight) {
    text = "🧳 Separate tickets, " + fmtHm(bv.layoverMin) + ": collect & re-check, tight";
  } else {
    text = "🧳 Separate tickets: collect & re-check your bags";
  }
  renderChip(cardEl, "bags", color, text, "Click for baggage details",
    function () { panel.showBags(bv); }, pos, inline);
}

export const badge = { addBadge: addBadge, addRiskBadge: addRiskBadge, addFitBadge: addFitBadge, addBagBadge: addBagBadge };
