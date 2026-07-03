/*
 * GetStopover — collapsible detail panel (site-agnostic).
 *
 * Clicking a result chip calls panel.show(verdict): a fixed bottom-right card
 * with the full programme breakdown. Header bar toggles collapse/expand; it can't
 * be dismissed. Rendered in a shadow root so the host site's CSS can't touch it.
 *
 * The "Transit visa" row has an INLINE nationality picker: pick once, it persists
 * to chrome.storage.local (on-device, never transmitted), recomputes the verdict
 * locally from the bundled data, refreshes the chips, and auto-populates every
 * future card. panel.refresh() re-renders when the popup changes nationality.
 */
import type { BagVerdict, FitVerdict, RiskVerdict, Verdict } from "../types";
import { settings } from "./settings";
import { engine } from "./engine";
import { visaLive } from "../data/visa-live";

const HOST_ID = "getstopover-panel-host";
const BASE = "https://www.getstopover.com/programs/";
const UTM = "?utm_source=extension&utm_medium=panel";
const DOT: Record<string, string> = { green: "#16a34a", amber: "#d97706", grey: "#64748b" };
const CONF_TIP = "Stopover & fare eligibility for this itinerary (hub, layover, ticket). Separate from the " +
  "Transit visa line below.";
// Passports we have visa data for (code -> display name), sorted by name.
const PASSPORTS: [string, string][] = [
  ["AE", "United Arab Emirates"], ["AU", "Australia"], ["BR", "Brazil"], ["CA", "Canada"],
  ["CN", "China"], ["DE", "Germany"], ["ES", "Spain"], ["FR", "France"], ["GB", "United Kingdom"],
  ["ID", "Indonesia"], ["IE", "Ireland"], ["IN", "India"], ["IT", "Italy"], ["JP", "Japan"],
  ["KR", "South Korea"], ["MX", "Mexico"], ["MY", "Malaysia"], ["NG", "Nigeria"], ["NL", "Netherlands"],
  ["NZ", "New Zealand"], ["PH", "Philippines"], ["PK", "Pakistan"], ["PL", "Poland"], ["RU", "Russia"], ["SA", "Saudi Arabia"],
  ["SE", "Sweden"], ["SG", "Singapore"], ["TH", "Thailand"], ["TR", "Turkey"], ["US", "United States"],
  ["ZA", "South Africa"],
];

const VISA: Record<string, { t: string; c: string }> = {
  free:          { t: "Visa-free transit",       c: "#16a34a" },
  voa:           { t: "Visa on arrival",         c: "#d97706" },
  evisa:         { t: "E-visa required",         c: "#d97706" },
  required:      { t: "Visa required to leave",  c: "#dc2626" },
  unknown:       { t: "check for your passport", c: "#64748b" },
  "no-passport": { t: "set your nationality",    c: "#4f46e5" },
};

var root: ShadowRoot | null = null;
var collapsed = false;
var current: Verdict | null = null; // last verdict shown
var editingVisaHub: string | null = null; // airport code whose passport picker is open
var manual: "light" | "dark" | null = null;
var lastPageDark = false;
var followT: ReturnType<typeof setTimeout> | null = null;
var tipTimer: ReturnType<typeof setTimeout> | null = null;

const CSS =
  ":host { all: initial; }" +
  '* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
  ".wrap { --bg:#fff; --fg:#0f172a; --border:#e6e8ec; --shadow:rgba(15,23,42,.22); --muted:#64748b;" +
  "  --faint:#94a3b8; --rowbd:#f1f5f9; --chip:#f1f5f9; --input:#d8dee8; --head2:#334155; --why:#475569;" +
  "  --link:#4f46e5; --accent:#4f46e5; --accenth:#4338ca; --onacc:#fff;" +
  "  --card:#fbfcfe; --cardbd:#e6e8ec; --gfg:#0d652d; --gbg:#e6f4ea; --afg:#92400e; --abg:#fef3c7;" +
  "  --rfg:#b91c1c; --rbg:#fee2e2; --sfg:#334155; --sbg:#eef1f5;" +
  "  width: 362px; max-width: calc(100vw - 32px); max-height: calc(100vh - 36px);" +
  "  display: flex; flex-direction: column; background: var(--bg); color: var(--fg);" +
  "  border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 14px 36px var(--shadow); overflow: hidden; }" +
  '.wrap[data-theme="dark"] { --bg:#282a2e; --fg:#e8eaed; --border:#3c4043; --shadow:rgba(0,0,0,.55); --muted:#9aa0a6;' +
  "  --faint:#80868b; --rowbd:#35363a; --chip:#35363a; --input:#5f6368; --head2:#cdd1d6; --why:#bdc1c6;" +
  "  --link:#a5b4fc; --accent:#4f46e5; --accenth:#6366f1; --onacc:#fff;" +
  "  --card:#303134; --cardbd:#3c4043; --gfg:#86efac; --gbg:rgba(134,239,172,.15); --afg:#fcd34d; --abg:rgba(252,211,77,.15);" +
  "  --rfg:#fca5a5; --rbg:rgba(252,165,165,.14); --sfg:#cbd5e1; --sbg:#35363a; }" +
  ".head { display: flex; align-items: center; gap: 8px; width: 100%; flex: none; border: 0; background: var(--accent);" +
  "  color: var(--onacc); padding: 10px 12px; cursor: pointer; font-size: 13px; font-weight: 700; }" +
  ".head .dot { width: 10px; height: 10px; border-radius: 50%; background: #64748b; box-shadow: 0 0 0 2px rgba(255,255,255,.55); flex: none; }" +
  ".head .ttl { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }" +
  ".head .theme { flex: none; cursor: pointer; font-size: 13px; line-height: 1; opacity: .85; }" +
  ".head .theme:hover { opacity: 1; }" +
  ".head .chev { transition: transform .15s ease; flex: none; }" +
  '.wrap[data-collapsed="true"] .chev { transform: rotate(180deg); }' +
  '.wrap[data-collapsed="true"] .body { display: none; }' +
  ".body { padding: 12px; overflow-y: auto; min-height: 0; }" +
  ".conf { font-size: 12px; font-weight: 700; margin-bottom: 6px; }" +
  ".prog { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--fg); }" +
  ".row { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; padding: 5px 0; border-top: 1px solid var(--rowbd); }" +
  ".row .k { color: var(--muted); flex: none; } .row .v { font-weight: 600; text-align: right; }" +
  ".est { font-size: 9px; font-weight: 600; color: var(--faint); background: var(--chip); padding: 1px 5px;" +
  "  border-radius: 999px; margin-left: 5px; cursor: help; white-space: nowrap; }" +
  ".gs-sel { font-size: 12px; padding: 3px 6px; border: 1px solid var(--input); border-radius: 7px;" +
  "  background: var(--bg); color: var(--fg); max-width: 175px; font-weight: 600; }" +
  ".gs-change { font-size: 10px; font-weight: 400; color: var(--faint); text-decoration: underline; margin-left: 6px; cursor: pointer; }" +
  ".gs-change:hover { color: var(--muted); }" +
  ".gs-for { font-size: 10px; font-weight: 600; color: var(--faint); margin-left: 5px; }" +
  ".gs-visalink { color: var(--link); text-decoration: underline; font-weight: 600; }" +
  ".whyhd { font-size: 11px; font-weight: 700; color: var(--head2); margin: 10px 0 0; }" +
  ".why { margin: 4px 0 10px; padding-left: 16px; }" +
  ".why li { font-size: 11px; color: var(--why); line-height: 1.45; margin: 2px 0; }" +
  ".cta { display: block; text-align: center; text-decoration: none; background: var(--accent); color: var(--onacc);" +
  "  font-size: 13px; font-weight: 600; padding: 9px 12px; border-radius: 10px; }" +
  ".cta:hover { background: var(--accenth); }" +
  ".elig { display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:999px; margin-bottom:10px; }" +
  ".elig::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }" +
  ".elig.amber { color:var(--afg); background:var(--abg); } .elig.grey { color:var(--sfg); background:var(--sbg); } .elig.green { color:var(--gfg); background:var(--gbg); }" +
  ".summary { display:flex; gap:8px; margin-bottom:10px; }" +
  ".sstat { flex:1; background:var(--card); border:1px solid var(--cardbd); border-radius:10px; padding:8px 10px; }" +
  ".sstat .sk { font-size:10px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--faint); }" +
  ".sstat .sv { font-size:16px; font-weight:800; letter-spacing:-.02em; margin-top:2px; font-variant-numeric:tabular-nums; }" +
  ".sstat .sv.green { color:var(--gfg); } .sstat .ssub { font-size:10.5px; color:var(--muted); margin-top:1px; }" +
  ".hub { border:1px solid var(--cardbd); border-radius:12px; overflow:hidden; margin-bottom:10px; }" +
  ".hubhead { display:flex; align-items:center; gap:8px; padding:10px 12px 9px; }" +
  ".hubhead .num { width:19px; height:19px; border-radius:50%; border:1.5px solid var(--accent); color:var(--accent); font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex:none; }" +
  ".hubhead .city { font-size:15px; font-weight:800; letter-spacing:-.01em; }" +
  ".hubhead .code { font-size:11px; font-weight:700; color:var(--muted); }" +
  ".hubhead .legtag { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--gbg); color:var(--gfg); }" +
  ".chips { display:flex; flex-wrap:wrap; gap:6px; padding:0 12px 10px; }" +
  ".chip { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:4px 8px; border-radius:7px; white-space:nowrap; }" +
  ".chip.green { color:var(--gfg); background:var(--gbg); } .chip.amber { color:var(--afg); background:var(--abg); } .chip small { font-weight:500; opacity:.85; }" +
  ".hubrows { padding:0 12px; }" +
  ".leglabel { color:var(--muted); font-weight:400; font-size:10.5px; }" +
  ".hubwhy { padding:2px 12px 10px; }" +
  ".note { font-size:11px; font-weight:600; color:var(--afg); background:var(--abg); border-radius:8px; padding:7px 9px; line-height:1.4; margin-bottom:10px; }" +
  ".warnbanner { display:flex; gap:9px; background:var(--rbg); border-radius:10px; padding:10px 11px; margin-bottom:10px; }" +
  ".warnbanner .wicon { font-size:15px; line-height:1.3; flex:none; }" +
  ".warnbanner .wtitle { font-size:13px; font-weight:800; letter-spacing:-.01em; }" +
  ".warnbanner .wsub { font-size:11.5px; font-weight:700; color:var(--rfg); margin-top:2px; }" +
  ".warnbanner .wline { font-size:11px; color:var(--muted); margin-top:3px; line-height:1.4; }" +
  ".whymini { display:flex; gap:7px; margin-bottom:10px; }" +
  ".whymini .wm { flex:1; background:var(--card); border:1px solid var(--cardbd); border-radius:9px; padding:8px 6px; text-align:center; }" +
  ".whymini .wmi { font-size:15px; line-height:1; } .whymini .wmt { font-size:10px; font-weight:700; margin-top:4px; line-height:1.2; }" +
  ".seclabel { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--faint); margin-bottom:2px; }" +
  ".steps { display:flex; flex-direction:column; margin-bottom:10px; }" +
  ".step { display:flex; gap:10px; align-items:flex-start; padding:8px 0; }" +
  ".step + .step { border-top:1px solid var(--rowbd); }" +
  ".step .sn { width:20px; height:20px; border-radius:50%; font-size:11px; font-weight:800; color:#fff; display:flex; align-items:center; justify-content:center; flex:none; margin-top:1px; }" +
  ".sn.i1, .sn.i2 { background:var(--accent); } .sn.i3 { background:#16a34a; } .sn.i4 { background:#d97706; } .sn.i5 { background:#64748b; }" +
  ".step .sbody { flex:1; min-width:0; } .step .stitle { font-size:12.5px; font-weight:700; }" +
  ".step .sdesc { font-size:11px; color:var(--muted); margin-top:1px; line-height:1.4; }" +
  ".step .spill { font-size:9px; font-weight:700; padding:2px 7px; border-radius:999px; flex:none; margin-top:2px; }" +
  ".spill.req { color:var(--rfg); background:var(--rbg); }" +
  ".fitbanner { display:flex; align-items:flex-start; gap:10px; border-radius:10px; padding:11px 12px; margin-bottom:12px; }" +
  ".fitbanner.red { background:var(--rbg); } .fitbanner.amber { background:var(--abg); }" +
  ".fitbanner .wicon { font-size:16px; line-height:1.2; flex:none; }" +
  ".fitbanner .fb-main { flex:1; min-width:0; }" +
  ".fitbanner .fb-title { font-size:13.5px; font-weight:800; letter-spacing:-.01em; line-height:1.25; }" +
  ".fitbanner.red .fb-title { color:var(--rfg); } .fitbanner.amber .fb-title { color:var(--afg); }" +
  ".fitbanner .fb-sub { font-size:11.5px; color:var(--fg); margin-top:3px; line-height:1.4; }" +
  ".fitbanner .fb-pill { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; border:1px solid currentColor; flex:none; white-space:nowrap; }" +
  ".fitbanner.red .fb-pill { color:var(--rfg); } .fitbanner.amber .fb-pill { color:var(--afg); }" +
  ".vsbox { display:flex; align-items:center; gap:8px; border:1px solid; border-radius:10px; padding:10px 12px; margin-bottom:12px; }" +
  ".vsbox.red { border-color:rgba(220,38,38,.28); background:var(--rbg); } .vsbox.amber { border-color:rgba(217,119,6,.28); background:var(--abg); }" +
  ".vsbox .vs-side { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }" +
  ".vsbox .vs-right { justify-content:flex-end; text-align:right; }" +
  ".vsbox .vs-ico { width:26px; height:26px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:13px; flex:none; }" +
  ".vsbox .vs-lbl { font-size:10.5px; color:var(--muted); }" +
  ".vsbox .vs-big { font-size:17px; font-weight:800; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }" +
  ".vsbox.red .vs-big { color:var(--rfg); } .vsbox.amber .vs-big { color:var(--afg); }" +
  ".vsbox .vs-vs { font-size:10px; font-weight:700; color:var(--muted); width:26px; height:26px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; flex:none; }" +
  ".fithd { font-size:12px; font-weight:800; margin:0 0 9px; }" +
  ".fitwhy { display:flex; flex-direction:column; gap:11px; margin-bottom:12px; }" +
  ".fw-item { display:flex; gap:10px; align-items:flex-start; }" +
  ".fw-ico { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; flex:none; }" +
  ".fw-ico.red { background:var(--rbg); } .fw-ico.amber { background:var(--abg); }" +
  ".fw-txt { font-size:11.5px; color:var(--why); line-height:1.45; }" +
  ".tipbox { border-radius:10px; padding:11px 12px; }" +
  ".tipbox.red { background:var(--rbg); } .tipbox.amber { background:var(--abg); }" +
  ".tip-hd { display:flex; align-items:center; gap:7px; margin-bottom:3px; }" +
  ".tip-ttl { font-size:12px; font-weight:800; }" +
  ".tipbox.red .tip-ttl { color:var(--rfg); } .tipbox.amber .tip-ttl { color:var(--afg); }" +
  ".tip-txt { font-size:11.5px; color:var(--fg); line-height:1.45; }" +
  ".alertbanner { display:flex; gap:12px; align-items:flex-start; background:var(--rbg); border-radius:12px; padding:14px; margin-bottom:12px; }" +
  ".alertbanner .ab-ico { width:40px; height:40px; border-radius:10px; background:rgba(220,38,38,.14); display:flex; align-items:center; justify-content:center; font-size:19px; flex:none; }" +
  ".alertbanner .ab-title { font-size:14px; font-weight:800; color:var(--rfg); line-height:1.25; letter-spacing:-.01em; }" +
  ".alertbanner .ab-sub { font-size:12px; font-weight:700; color:var(--fg); margin-top:4px; line-height:1.4; }" +
  ".actgrid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }" +
  ".actcard { border:1px solid var(--cardbd); border-radius:10px; padding:9px 10px; }" +
  ".actcard .ac-ico { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:13px; margin-bottom:6px; }" +
  ".actcard .ac-title { font-size:11.5px; font-weight:800; line-height:1.2; }" +
  ".actcard .ac-desc { font-size:10.5px; color:var(--muted); margin-top:3px; line-height:1.35; }" +
  ".whyhead { display:flex; align-items:center; gap:8px; margin:2px 0 11px; }" +
  ".whyhead .wh-q { width:22px; height:22px; border-radius:50%; background:var(--fg); color:var(--bg); font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex:none; }" +
  ".whyhead .wh-t { font-size:13px; font-weight:800; }" +
  ".infobox { display:flex; gap:10px; align-items:flex-start; background:var(--sbg); border-radius:10px; padding:11px 12px; }" +
  ".infobox .ib-ico { font-size:15px; flex:none; }" +
  ".infobox .ib-title { font-size:12px; font-weight:800; }" +
  ".infobox .ib-txt { font-size:11px; color:var(--muted); margin-top:2px; line-height:1.4; }" +
  ".infobox.green { background:var(--gbg); } .infobox.green .ib-title { color:var(--gfg); }" +
  ".infobox.amber { background:var(--abg); } .infobox.amber .ib-title { color:var(--afg); }" +
  ".infobox.red { background:var(--rbg); } .infobox.red .ib-title { color:var(--rfg); }" +
  ".tip { position: fixed; z-index: 2147483647; max-width: 280px; background: #fff; color: #202124;" +
  "  font-size: 12px; line-height: 1.55; padding: 9px 12px; border-radius: 8px; white-space: pre-line;" +
  "  box-shadow: 0 2px 8px rgba(60,64,67,.2), 0 1px 3px rgba(60,64,67,.25); pointer-events: none;" +
  "  visibility: hidden; opacity: 0; transition: opacity .1s; }" +
  ".tip.tdark { background: #3c4043; color: #e8eaed; box-shadow: 0 2px 10px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.4); }" +
  ".tip.show { visibility: visible; opacity: 1; }";

function esc(s: unknown): string {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c];
  });
}

function programUrl(slug: string): string {
  return BASE + esc(slug) + UTM + (settings.passport ? "&passport=" + encodeURIComponent(settings.passport) : "");
}

function fmtLayover(min: number | null): string | null {
  if (min == null) return null;
  var h = Math.floor(min / 60), m = min % 60;
  return h + "h" + (m ? " " + m + "m" : "");
}

function confText(v: Verdict): string {
  if (v.confidence === "green") return "Confirmed: you qualify";
  if (v.confidence === "amber") return "Likely eligible: verify your fare";
  return "Programme exists: unverified for this trip";
}

function ensure(): void {
  if (root) return;
  var host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText = "position:fixed;bottom:18px;right:18px;z-index:2147483647;";
    (document.body || document.documentElement).appendChild(host);
  }
  root = host.shadowRoot || host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>" + CSS + "</style>" +
    '<div class="wrap" data-collapsed="false">' +
      '<button class="head" type="button">' +
        '<span class="dot"></span><span class="ttl">GetStopover</span>' +
        '<span class="theme" role="button" aria-label="Toggle theme"></span><span class="chev">▾</span>' +
      "</button>" +
      '<div class="body"></div>' +
    "</div>" +
    '<div class="tip"></div>';
  root.querySelector(".head")!.addEventListener("click", function () {
    collapsed = !collapsed;
    root!.querySelector(".wrap")!.setAttribute("data-collapsed", collapsed ? "true" : "false");
    hideTip();
  });
  var themeBtn = root.querySelector(".theme");
  if (themeBtn) themeBtn.addEventListener("click", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    manual = effectiveTheme() === "dark" ? "light" : "dark";
    syncTheme();
  });
  lastPageDark = pageIsDark();
  try {
    var mo = new MutationObserver(scheduleFollow);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (mq && mq.addEventListener) mq.addEventListener("change", scheduleFollow);
  } catch (e) { /* ignore */ }
  try { setInterval(autoFollow, 1500); } catch (e) { /* ignore */ }
  syncTheme();
}

function row(k: string, val: string): string {
  return '<div class="row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(val) + "</span></div>";
}

function passportName(code: string | null | undefined): string {
  if (!code) return "";
  for (var i = 0; i < PASSPORTS.length; i++) if (PASSPORTS[i][0] === code) return PASSPORTS[i][1];
  return code;
}

function passportOptions(): string {
  var cur = settings.passport || "";
  var out = ['<option value="">Select your passport</option>'];
  for (var i = 0; i < PASSPORTS.length; i++) {
    var c = PASSPORTS[i][0], n = PASSPORTS[i][1];
    out.push('<option value="' + c + '"' + (c === cur ? " selected" : "") + ">" + esc(n) + "</option>");
  }
  return out.join("");
}

// Transit-visa row with the inline nationality picker, scoped to one hub so a
// multi-hub itinerary shows each hub's own country verdict.
function visaRowForHub(hv: Verdict): string {
  var visa = hv.visa;
  if (!visa) return "";
  var hub = esc(hv.airport);
  var val: string;
  if (editingVisaHub === hv.airport || visa.status === "no-passport") {
    val = '<select class="gs-sel" data-hub="' + hub + '">' + passportOptions() + "</select>";
  } else if (visa.status === "loading") {
    val = '<span style="color:var(--muted)">checking…</span>';
  } else if (visa.live) {
    var m = VISA[visa.status] || VISA.unknown;
    var code = settings.passport;
    var hrs = (visa.maxTransitHours && visa.maxTransitHours <= 240) ? " up to " + visa.maxTransitHours + "h" : "";
    var vtip = (code ? "Personalised to your " + passportName(code) + " passport: whether you can leave the " +
      "airport during the layover. Separate from the header's fare-eligibility note. " : "") + (visa.notes || "");
    val = '<span style="color:' + m.c + '" title="' + esc(vtip) + '">' + esc(m.t) + esc(hrs) + "</span>" +
      (code ? '<span class="gs-for">· ' + esc(code) + "</span>" : "") +
      '<a class="gs-change" data-hub="' + hub + '">change</a>';
  } else {
    return '<div class="row"><span class="k">Transit visa</span><span class="v">' +
      '<a class="gs-visalink" href="' + programUrl(hv.slug) + '" target="_blank" rel="noopener" ' +
      'title="Transit-visa rules are nationality-specific. Check the program page for your passport. A wrong ' +
      'visa-free assumption can mean being denied boarding.">check for your passport →</a></span></div>';
  }
  return '<div class="row"><span class="k">Transit visa</span><span class="v">' + val + "</span></div>";
}

function toneChip(tone: string, icon: string, text: string, sub: string): string {
  return '<span class="chip ' + tone + '">' + icon + " " + esc(text) +
    (sub ? ' <small>' + esc(sub) + "</small>" : "") + "</span>";
}

// Layover + time-to-explore rows for one hub, one line per qualifying leg.
function legRows(hv: Verdict): string {
  var legs: { layoverMin: number | null }[] =
    (hv.legStops && hv.legStops.length) ? hv.legStops : [{ layoverMin: hv.layoverMin }];
  var twoLeg = legs.length >= 2;
  var labels = twoLeg ? ["outbound", "return"] : [""];
  var out: string[] = [];
  for (var i = 0; i < legs.length; i++) {
    var min = legs[i].layoverMin;
    var lab = twoLeg ? ' <span class="leglabel">· ' + esc(labels[i] || "leg " + (i + 1)) + "</span>" : "";
    var lay = fmtLayover(min);
    if (lay) out.push('<div class="row"><span class="k">Layover' + lab + '</span><span class="v">' + esc(lay) + "</span></div>");
    var ip = engine.usableParts(hv.airport, min);
    if (ip) {
      var uv = ip.net > 0 ? "~" + hm(Math.round(ip.net / 5) * 5) : "too tight";
      out.push('<div class="row"><span class="k">Time to explore' + lab + '</span><span class="v">' + uv +
        ' <span class="est" data-tip="' + esc(exploreTip(min, ip)) + '">ⓘ estimate</span></span></div>');
    }
  }
  return out.join("");
}

// One card per stopover hub.
function hubCard(hv: Verdict, idx: number, multi: boolean): string {
  // Separate tickets: the free-stopover perk needs one through-ticket, so it
  // won't apply as booked. Suppress the perk chips/rows (they'd read as a
  // promise); keep the layover facts, which are true regardless of the ticket.
  var stIneligible = !!hv.selfTransfer;
  var out: string[] = ['<div class="hub">'];
  out.push('<div class="hubhead">');
  if (multi) out.push('<span class="num">' + (idx + 1) + "</span>");
  out.push('<span class="city">' + esc(hv.city) + '</span><span class="code">' + esc(hv.airport) + "</span>");
  var twoLeg = !!(hv.legStops && hv.legStops.length >= 2);
  if (twoLeg && !stIneligible) out.push('<span class="legtag">' + (hv.oncePerTrip ? "Either leg" : "Both legs") + "</span>");
  out.push("</div>");

  if (stIneligible) {
    out.push('<div class="hubwhy"><div class="note">The free ' + esc(hv.city) + " stopover needs one " +
      esc(hv.airline) + " ticket, so it won't apply to these separate tickets.</div></div>");
  } else {
    var chips: string[] = [];
    if (hv.hotelModel === "free") chips.push(toneChip("green", "🏨", "Free hotel", "1 night"));
    else if (hv.hotelModel === "no-airfare-only") chips.push(toneChip("green", "🏨", "Free stopover", ""));
    if (hv.freeTours) chips.push(toneChip("amber", "🚶", "Free city tour", ""));
    if (chips.length) out.push('<div class="chips">' + chips.join("") + "</div>");
  }

  out.push('<div class="hubrows">');
  out.push(legRows(hv));
  if (!stIneligible) {
    if (hv.hotelModel === "free" && hv.hotelValueUSD) {
      out.push('<div class="row"><span class="k">Free hotel</span><span class="v" style="color:var(--gfg)">up to ~$' +
        hv.hotelValueUSD + (hv.hotelConditional ? " (if eligible)" : "") + "</span></div>");
    }
    if (hv.freeTours) {
      out.push('<div class="row"><span class="k">Free city tour</span><span class="v" style="color:var(--gfg)">Available</span></div>');
    }
  }
  out.push(visaRowForHub(hv));
  if (!stIneligible && hv.maxDays) out.push('<div class="row"><span class="k">Max stay</span><span class="v">Up to ' +
    hv.maxDays + " day" + (hv.maxDays > 1 ? "s" : "") + "</span></div>");
  out.push("</div>");

  if (hv.reasons && hv.reasons.length) {
    out.push('<div class="hubwhy"><div class="whyhd">Before you book' + (multi ? " (" + esc(hv.airline) + ")" : "") +
      '</div><ul class="why">' + hv.reasons.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></div>");
  }
  out.push("</div>");
  return out.join("");
}

// Summary strip shown only when the itinerary has 2+ different hubs.
function summaryStrip(hubs: Verdict[]): string {
  var totalExplore = 0, totalValue = 0;
  for (var i = 0; i < hubs.length; i++) {
    var hv = hubs[i];
    var legs: { layoverMin: number | null }[] =
      (hv.legStops && hv.legStops.length) ? hv.legStops : [{ layoverMin: hv.layoverMin }];
    for (var j = 0; j < legs.length; j++) {
      var ip = engine.usableParts(hv.airport, legs[j].layoverMin);
      if (ip && ip.net > 0) totalExplore += ip.net;
    }
    if (hv.hotelModel === "free" && hv.hotelValueUSD) totalValue += hv.hotelValueUSD;
  }
  var explore = totalExplore > 0 ? "~" + hm(Math.round(totalExplore / 5) * 5) : "tight";
  var out = '<div class="summary"><div class="sstat"><div class="sk">Time to explore</div><div class="sv">' +
    explore + '</div><div class="ssub">across ' + hubs.length + " stopovers</div></div>";
  if (totalValue > 0) out += '<div class="sstat"><div class="sk">Value</div><div class="sv green">up to ~$' +
    totalValue + '</div><div class="ssub">per person</div></div>';
  return out + "</div>";
}

function exploreTip(layoverMin: number | null, p: { exit: number; toCity: number; buffer: number; net: number }): string {
  var lay = fmtLayover(layoverMin) || "";
  var lines = [
    "How we work this out",
    "",
    "Your " + lay + " layover, minus:",
    "• Leave the airport: " + hm(p.exit),
    "• To the city centre: " + hm(p.toCity),
    "• Back to the airport: " + hm(p.toCity),
    "• Buffer before your flight: " + hm(p.buffer),
    "",
    p.net > 0 ? "≈ " + hm(Math.round(p.net / 5) * 5) + " to explore" : "Likely too tight to leave the airport",
  ];
  if (settings.confidentTraveler) { lines.push(""); lines.push("Confident-traveller trim on: buffer cut 30m."); }
  return lines.join("\n");
}

function bodyHtml(v: Verdict): string {
  var hubs: Verdict[] = [v].concat(v.otherVerdicts || []);
  var multi = hubs.length >= 2;
  var html: string[] = [];

  var tone = v.confidence === "green" ? "green" : (v.confidence === "grey" ? "grey" : "amber");
  var elig: string;
  if (v.selfTransfer) elig = "Separate tickets: won't qualify as booked";
  else if (multi) elig = hubs.length + " stopovers · verify your fare";
  else elig = confText(v);
  html.push('<span class="elig ' + tone + '" title="' + esc(CONF_TIP) + '">' + esc(elig) + "</span>");

  if (multi) html.push(summaryStrip(hubs));
  for (var i = 0; i < hubs.length; i++) html.push(hubCard(hubs[i], i, multi));

  if (!multi && v.legStops && v.legStops.length >= 2) {
    var legLine = v.oncePerTrip
      ? "This perk is once per trip. Pick whichever direction suits you."
      : "Both legs qualify for this perk.";
    html.push('<div class="note">' + esc(legLine) + "</div>");
  }

  html.push('<a class="cta" href="' + programUrl(v.slug) + '" target="_blank" rel="noopener">How to book ' +
    (multi ? "these stopovers" : "this stopover") + " →</a>");
  return html.join("");
}

function persistPassport(code: string | null): void {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ passport: code });
    }
  } catch (e) { /* ignore */ }
  settings.passport = code; // optimistic, instant
}

function autoFollow(): void {
  var d = pageIsDark();
  if (d === lastPageDark) return;
  lastPageDark = d;
  manual = null;
  syncTheme();
}

function scheduleFollow(): void {
  if (followT) return;
  followT = setTimeout(function () { followT = null; autoFollow(); }, 120);
}

function pageIsDark(): boolean {
  try {
    var el: Element | null = document.body || document.documentElement;
    while (el) {
      var m = getComputedStyle(el).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m && (!m[4] || parseFloat(m[4]) > 0)) {
        return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) < 128;
      }
      el = el.parentElement;
    }
  } catch (e) { /* ignore */ }
  try {
    var tm = getComputedStyle(document.body).color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (tm) return (0.299 * +tm[1] + 0.587 * +tm[2] + 0.114 * +tm[3]) >= 128;
  } catch (e) { /* ignore */ }
  try { return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); } catch (e) { return false; }
}

function effectiveTheme(): "light" | "dark" {
  return manual ? manual : (pageIsDark() ? "dark" : "light");
}

function syncTheme(): void {
  if (!root) return;
  var th = effectiveTheme();
  var wrap = root.querySelector(".wrap") as HTMLElement | null;
  if (wrap) wrap.setAttribute("data-theme", th);
  var t = root.querySelector(".theme") as HTMLElement | null;
  if (t) {
    t.textContent = th === "dark" ? "☀️" : "🌙";
    t.setAttribute("title", th === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
}

function hideTip(): void {
  if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
  if (!root) return;
  var tip = root.querySelector(".tip");
  if (tip) tip.classList.remove("show");
}

function showTip(badge: HTMLElement): void {
  if (!root) return;
  var tip = root.querySelector(".tip") as HTMLElement | null;
  if (!tip) return;
  var txt = badge.getAttribute("data-tip");
  if (!txt) return;
  tip.textContent = txt;
  var r = badge.getBoundingClientRect();
  tip.style.left = "auto";
  tip.style.top = "auto";
  tip.style.right = Math.max(8, window.innerWidth - r.right) + "px";
  tip.style.bottom = (window.innerHeight - r.top + 6) + "px";
  tip.classList.toggle("tdark", effectiveTheme() === "dark");
  tip.classList.add("show");
}

function wireControls(): void {
  if (!root) return;
  var sels = root.querySelectorAll(".gs-sel");
  for (var si = 0; si < sels.length; si++) {
    sels[si].addEventListener("change", function (this: HTMLSelectElement) {
      editingVisaHub = null;
      persistPassport(this.value || null);
      refresh();
    });
  }
  var chs = root.querySelectorAll(".gs-change");
  for (var ci = 0; ci < chs.length; ci++) {
    chs[ci].addEventListener("click", function (this: HTMLElement, ev: Event) {
      ev.preventDefault();
      ev.stopPropagation();
      editingVisaHub = this.getAttribute("data-hub");
      renderBody();
    });
  }
  var ests = root.querySelectorAll(".est");
  for (var ei = 0; ei < ests.length; ei++) {
    (function (est: HTMLElement) {
      est.addEventListener("mouseenter", function () {
        if (tipTimer) clearTimeout(tipTimer);
        tipTimer = setTimeout(function () { showTip(est); }, 100);
      });
      est.addEventListener("mouseleave", function () {
        if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
        hideTip();
      });
    })(ests[ei] as HTMLElement);
  }
}

function renderBody(): void {
  if (!root || !current) return;
  hideTip();
  (root.querySelector(".dot")! as HTMLElement).style.background = DOT[current.confidence] || DOT.grey;
  var multi = !!(current.otherVerdicts && current.otherVerdicts.length);
  root.querySelector(".ttl")!.textContent = multi ? "Your stopovers" : current.city + " stopover";
  root.querySelector(".body")!.innerHTML = bodyHtml(current);
  wireControls();
  syncTheme();
}

function hubList(): Verdict[] {
  if (!current) return [];
  return [current].concat(current.otherVerdicts || []);
}

// Fetch the live transit-visa verdict for each hub's country and re-render as
// each resolves.
function loadLiveVisaAll(): void {
  var passport = settings.passport;
  if (!passport) return;
  var hubs = hubList();
  var pending = hubs.filter(function (hv) { return !!hv.country; });
  if (!pending.length) return;
  pending.forEach(function (hv) { hv.visa = { status: "loading" }; });
  renderBody();
  pending.forEach(function (hv) {
    var country = hv.country;
    visaLive.fetch(passport as string, country, function (live) {
      if (!current || (settings.passport || null) !== passport) return;
      hv.visa = live || { status: "unknown" };
      renderBody();
    });
  });
}

// Recompute the visa verdict from the latest nationality and re-render.
function refresh(): void {
  if (!current) return;
  hubList().forEach(function (hv) {
    if (hv.country) hv.visa = engine.visaVerdict(hv.country);
    hv.usableHours = engine.usableHours(hv.airport, hv.layoverMin);
  });
  renderBody();
  loadLiveVisaAll();
}

function show(v: Verdict): void {
  ensure();
  if (!root) return;
  current = v;
  editingVisaHub = null;
  [v].concat(v.otherVerdicts || []).forEach(function (hv) {
    if (hv.country) hv.visa = engine.visaVerdict(hv.country);
    hv.usableHours = engine.usableHours(hv.airport, hv.layoverMin);
  });
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  renderBody();
  loadLiveVisaAll();
}

function actCard(bg: string, icon: string, title: string, desc: string): string {
  return '<div class="actcard"><div class="ac-ico" style="background:' + bg + '">' + icon +
    '</div><div class="ac-title">' + esc(title) + '</div><div class="ac-desc">' + esc(desc) + "</div></div>";
}

// Bold the lead clause of a reason (up to its first sentence/clause break).
function boldLead(s: string): string {
  var m = s.match(/^(.+?[.:!?])\s+(.*)$/);
  if (m) return "<b>" + esc(m[1]) + "</b> " + esc(m[2]);
  return esc(s);
}

function riskBodyHtml(rv: RiskVerdict): string {
  var country = rv.countryLabel || (rv.country === "US" ? "US" : "Canadian");
  var cShort = rv.country === "CA" ? "Canada" : "US";
  var multi = (rv.hubCount || 1) > 1;
  var out: string[] = [];

  out.push('<div class="alertbanner"><span class="ab-ico">🛂</span><div>' +
    '<div class="ab-title">Heads up: ' + esc(rv.city) + (multi ? " are " + esc(country) + " border stops" : " is a " + esc(country) + " border stop") + "</div>" +
    '<div class="ab-sub">You must clear immigration ' + (multi ? "at each stop" : "here") + ", even just to connect.</div></div></div>");

  out.push('<div class="actgrid">' +
    actCard("rgba(79,70,229,.12)", "🛂", "Clear " + cShort + " immigration", "Required even if you're just connecting.") +
    actCard("rgba(22,163,74,.14)", "🧳", "Collect & re-check bags", "Collect your checked bags, then re-check them.") +
    actCard("rgba(14,165,233,.14)", "🛡️", "Re-clear security", "You go through security screening again.") +
    actCard("rgba(217,119,6,.14)", "🕐", "Allow extra time", "Budget 2-3 hours for the connection.") +
    "</div>");

  out.push('<div class="whyhead"><span class="wh-q">?</span><span class="wh-t">Why this matters</span></div>');
  var icons = ["🏛️", "🪪", "⏱️"];
  out.push('<div class="fitwhy">' + rv.reasons.map(function (r, i) {
    return '<div class="fw-item"><span class="fw-ico red">' + (icons[i] || "ℹ️") + '</span><span class="fw-txt">' + boldLead(r) + "</span></div>";
  }).join("") + "</div>");

  if (!multi && rv.hubLayoverMin != null) {
    var lm = rv.hubLayoverMin;
    var tone2 = lm >= 180 ? "green" : (lm >= 150 ? "amber" : "red");
    var ic = lm >= 180 ? "✅" : (lm >= 150 ? "🕐" : "⚠️");
    var read = lm >= 180
      ? "Comfortable for the ~2-3h you'll need to clear " + cShort + " immigration and re-check bags."
      : lm >= 150
      ? "Around the ~2-3h a " + cShort + " connection needs. A terminal change would add more."
      : "Likely too short to clear " + cShort + " immigration and re-check bags in time.";
    out.push('<div class="infobox ' + tone2 + '"><span class="ib-ico">' + ic + '</span><div>' +
      '<div class="ib-title">You have ' + esc(fmtLayover(lm) || "") + ' here</div>' +
      '<div class="ib-txt">' + esc(read) + "</div></div></div>");
  }
  return out.join("");
}

function showRisk(rv: RiskVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisaHub = null;
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  (root.querySelector(".dot")! as HTMLElement).style.background = "#dc2626";
  root.querySelector(".ttl")!.textContent = rv.city + ": transit alert";
  root.querySelector(".body")!.innerHTML = riskBodyHtml(rv);
  syncTheme();
}

function hm(min: number): string {
  var h = Math.floor(min / 60), m = min % 60;
  return h ? (h + "h" + (m ? " " + m + "m" : "")) : (m + "m");
}

function fitBodyHtml(fv: FitVerdict): string {
  var tone = fv.severity === "red" ? "red" : "amber";
  var hub = esc(fv.airport);
  var title = fv.severity === "red" ? "This connection may be too short at " + hub
    : "This connection is tight at " + hub;
  var pill = fv.severity === "red" ? "Risky" : "Tight";
  var have = hm(fv.layoverMin), need = "~" + hm(fv.needMin);
  var out: string[] = [];

  out.push('<div class="fitbanner ' + tone + '"><span class="wicon">⚠️</span>' +
    '<div class="fb-main"><div class="fb-title">' + title + '</div></div>' +
    '<span class="fb-pill ' + tone + '">⚠ ' + pill + "</span></div>");

  out.push('<div class="vsbox ' + tone + '">' +
    '<div class="vs-side"><span class="vs-ico">🕐</span><div><div class="vs-lbl">You have</div>' +
    '<div class="vs-big">' + esc(have) + '</div></div></div>' +
    '<span class="vs-vs">vs</span>' +
    '<div class="vs-side vs-right"><div><div class="vs-big">' + esc(need) + '</div>' +
    '<div class="vs-lbl">Our estimate</div></div></div></div>');

  out.push('<div class="fithd">How that estimate is built:</div>');
  var items: [string, string][] = [];
  if (fv.selfTransfer) {
    items.push(["🧳", "Separate tickets, so you must collect your bags, exit, re-check, and re-clear security, with no rebooking if the first flight is late. Budget ~" + hm(fv.needMin) + "+."]);
  } else {
    items.push(["🚶", "~" + hm(fv.parts.base) + " base: deplane and walk to a different gate, and boarding closes ~20-40 min before departure."]);
    if (fv.parts.intl) items.push(["🛡️", "+~" + hm(fv.parts.intl) + ": international transfer, security re-screen, longer terminal walks, earlier boarding close."]);
    if (fv.parts.mega) items.push(["🏢", "+~" + hm(fv.parts.mega) + ": " + fv.airport + " is a large, spread-out hub."]);
  }
  items.push(["ℹ️", "A terminal change (e.g. T2 to T5) would add more, but the search page doesn't show terminals, so this estimate can't include it."]);
  items.push(["ℹ️", "Conservative estimate, not the airline's official minimum connection time. If it's close, check the airline's MCT for " + fv.airport + "."]);
  out.push('<div class="fitwhy">' + items.map(function (it) {
    return '<div class="fw-item"><span class="fw-ico ' + tone + '">' + it[0] + '</span><span class="fw-txt">' + esc(it[1]) + "</span></div>";
  }).join("") + "</div>");

  var tip = fv.severity === "red"
    ? "If your first flight is delayed, you may miss your connection. Check the airline's MCT or consider more buffer time."
    : "It's doable, but leaves little room for delay. Keep an eye on your first flight's on-time status.";
  out.push('<div class="tipbox ' + tone + '"><div class="tip-hd"><span>💡</span><span class="tip-ttl">Travel tip</span></div>' +
    '<div class="tip-txt">' + esc(tip) + "</div></div>");
  return out.join("");
}

function showFit(fv: FitVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisaHub = null;
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  var color = fv.severity === "red" ? "#dc2626" : "#d97706";
  (root.querySelector(".dot")! as HTMLElement).style.background = color;
  root.querySelector(".ttl")!.textContent = "Connection insight";
  root.querySelector(".body")!.innerHTML = fitBodyHtml(fv);
  syncTheme();
}

function warnBanner(title: string, sub: string, line: string): string {
  return '<div class="warnbanner"><span class="wicon">⚠️</span><div><div class="wtitle">' + title +
    '</div><div class="wsub">' + esc(sub) + '</div><div class="wline">' + line + "</div></div></div>";
}

function whyMini(items: [string, string][]): string {
  return '<div class="whymini">' + items.map(function (it) {
    return '<div class="wm"><div class="wmi">' + it[0] + '</div><div class="wmt">' + esc(it[1]) + "</div></div>";
  }).join("") + "</div>";
}

// steps: [title, description, statusPill]
function stepList(steps: [string, string, string][]): string {
  return '<div class="steps">' + steps.map(function (st, i) {
    var pill = st[2] ? '<span class="spill req">' + esc(st[2]) + "</span>" : "";
    return '<div class="step"><span class="sn i' + (i + 1) + '">' + (i + 1) +
      '</span><div class="sbody"><div class="stitle">' + esc(st[0]) + '</div><div class="sdesc">' + esc(st[1]) + "</div></div>" + pill + "</div>";
  }).join("") + "</div>";
}

function bagBodyHtml(bv: BagVerdict): string {
  var hub = bv.hub || "your connection";
  var ehub = esc(hub);
  var out: string[] = [];
  if (bv.kind === "customs") {
    var country = bv.country === "CA" ? "Canada" : "US";
    var entry = bv.country === "CA" ? "eTA" : "ESTA";
    out.push(warnBanner("Re-check your bags at " + ehub, "Your bags don't go straight to your final airport",
      country + " customs is at your first " + country + " airport, not your destination."));
    out.push(whyMini([["🧳", "Collect bag"], ["🛂", "Clear customs"], ["🔁", "Re-check bag"]]));
    out.push('<div class="seclabel">What to do at ' + ehub + "</div>");
    out.push(stepList([
      ["Arrive at " + hub, "Your first " + country + " airport.", ""],
      ["Collect your checked bag", "Pick it up before customs.", "Required"],
      ["Clear customs & immigration", "You need an " + entry + " or visa to enter.", "Required"],
      ["Re-check your bag", "Drop it for your next flight.", "Required"],
      ["Re-clear security", "Then head to your departure gate.", ""],
    ]));
    out.push('<div class="note">Budget ~2-3 hours.' +
      (bv.layoverMin != null ? " You have about " + hm(bv.layoverMin) + " here." : "") + "</div>");
  } else {
    out.push(warnBanner("Your bag is NOT checked through", "Separate tickets: you re-check your bags",
      "At " + ehub + " you collect your bag and re-check it for the next flight."));
    out.push(whyMini([["🎫", "Separate tickets"], ["🧳", "Collect bag"], ["🔁", "Re-check bag"]]));
    out.push('<div class="seclabel">What to do at ' + ehub + "</div>");
    out.push(stepList([
      ["Arrive at " + hub, "Follow the signs to Baggage Claim.", ""],
      ["Collect your checked bag", "Pick it up from the carousel.", "Required"],
      ["Re-check your bag", "At the next airline's check-in desk.", "Required"],
      ["Clear security again", "Then head to your departure gate.", ""],
    ]));
    var note = (bv.layoverMin != null && bv.tight ? "Only " + hm(bv.layoverMin) + " here, very tight. " : "") +
      "If the first flight is late, no one re-books you and your bag won't make it, so you'd have to buy a new ticket.";
    out.push('<div class="note">' + esc(note) + "</div>");
  }
  return out.join("");
}

function showBags(bv: BagVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisaHub = null;
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  var color = (bv.kind === "customs" || bv.tight) ? "#dc2626" : "#d97706";
  (root.querySelector(".dot")! as HTMLElement).style.background = color;
  root.querySelector(".ttl")!.textContent = (bv.hub || "Connection") + " baggage";
  root.querySelector(".body")!.innerHTML = bagBodyHtml(bv);
  syncTheme();
}

export const panel = { show: show, refresh: refresh, showRisk: showRisk, showFit: showFit, showBags: showBags };
