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
var editingVisa = false;            // inline passport picker open?
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
  "  width: 320px; max-width: calc(100vw - 32px); max-height: calc(100vh - 36px);" +
  "  display: flex; flex-direction: column; background: var(--bg); color: var(--fg);" +
  "  border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 14px 36px var(--shadow); overflow: hidden; }" +
  '.wrap[data-theme="dark"] { --bg:#282a2e; --fg:#e8eaed; --border:#3c4043; --shadow:rgba(0,0,0,.55); --muted:#9aa0a6;' +
  "  --faint:#80868b; --rowbd:#35363a; --chip:#35363a; --input:#5f6368; --head2:#cdd1d6; --why:#bdc1c6;" +
  "  --link:#a5b4fc; --accent:#4f46e5; --accenth:#6366f1; --onacc:#fff; }" +
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

// Transit-visa row with the inline nationality picker.
function visaRow(v: Verdict): string {
  var visa = v.visa;
  if (!visa) return "";
  var val: string;
  if (editingVisa || visa.status === "no-passport") {
    val = '<select class="gs-sel">' + passportOptions() + "</select>";
  } else if (visa.status === "loading") {
    val = '<span style="color:#64748b">checking…</span>';
  } else if (visa.live) {
    var m = VISA[visa.status] || VISA.unknown;
    var code = settings.passport;
    var hrs = (visa.maxTransitHours && visa.maxTransitHours <= 240) ? " up to " + visa.maxTransitHours + "h" : "";
    var vtip = (code ? "Personalised to your " + passportName(code) + " passport: whether you can leave the " +
      "airport during the layover. Separate from the header's fare-eligibility note. " : "") + (visa.notes || "");
    val = '<span style="color:' + m.c + '" title="' + esc(vtip) + '">' + esc(m.t) + esc(hrs) + "</span>" +
      (code ? '<span class="gs-for">· ' + esc(code) + "</span>" : "") +
      '<a class="gs-change">change</a>';
  } else {
    return '<div class="row"><span class="k">Transit visa</span><span class="v">' +
      '<a class="gs-visalink" href="' + programUrl(v.slug) + '" target="_blank" rel="noopener" ' +
      'title="Transit-visa rules are nationality-specific. Check the program page for your passport. A wrong ' +
      'visa-free assumption can mean being denied boarding.">check for your passport →</a></span></div>';
  }
  return '<div class="row"><span class="k">Transit visa</span><span class="v">' + val + "</span></div>";
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
  var lay = fmtLayover(v.layoverMin);
  var html: string[] = [];
  html.push('<div class="conf" style="color:' + (DOT[v.confidence] || DOT.grey) + '" title="' + esc(CONF_TIP) + '">' + esc(confText(v)) + "</div>");
  html.push('<div class="prog">' + esc(v.airline) + (v.programName ? " · " + esc(v.programName) : "") + "</div>");
  if (v.legStops && v.legStops.length >= 2) {
    var labels = v.legStops.length === 2
      ? ["outbound", "return"]
      : v.legStops.map(function (s, i) { return "leg " + (i + 1); });
    for (var li = 0; li < v.legStops.length; li++) {
      var ls = v.legStops[li];
      var lsLay = fmtLayover(ls.layoverMin);
      if (lsLay) html.push(row("Layover (" + labels[li] + ")", lsLay + " in " + v.city + " · " + (ls.mode === "hotel" ? "free hotel" : "free tour")));
      var ipl = engine.usableParts(v.airport, ls.layoverMin);
      if (ipl) {
        var uvl = ipl.net > 0 ? "~" + hm(Math.round(ipl.net / 5) * 5) : "too tight";
        html.push('<div class="row"><span class="k">Time to explore (' + labels[li] + ')</span><span class="v">' + uvl +
          ' <span class="est" data-tip="' + esc(exploreTip(ls.layoverMin, ipl)) + '">ⓘ estimate</span></span></div>');
      }
    }
    var legLine = v.oncePerTrip
      ? "This perk can be used only once per trip. Pick whichever direction suits you."
      : "Both legs qualify for this perk.";
    html.push('<div style="font-size:11px;font-weight:600;color:#92400e;margin:4px 0">' + legLine + "</div>");
  } else {
    if (lay) html.push(row("Layover", lay + " in " + v.city));
    var ip = engine.usableParts(v.airport, v.layoverMin);
    if (ip) {
      var uv = ip.net > 0 ? "~" + hm(Math.round(ip.net / 5) * 5) : "too tight";
      html.push('<div class="row"><span class="k">Time to explore</span><span class="v">' + uv +
        ' <span class="est" data-tip="' + esc(exploreTip(v.layoverMin, ip)) + '">ⓘ estimate</span></span></div>');
    }
  }
  if (v.hotelModel === "free" && v.hotelValueUSD) {
    html.push(row("Free hotel", "up to ~$" + v.hotelValueUSD + (v.hotelConditional ? " (if eligible)" : "")));
  } else if (v.hotelModel === "no-airfare-only") {
    html.push(row("Hotel", "not included: free stopover = no extra airfare"));
  }
  if (v.freeTours) html.push(row("Free city tour", "yes"));
  html.push(visaRow(v));
  if (v.otherHubs && v.otherHubs.length) {
    html.push('<div style="font-size:11px;font-weight:600;color:#92400e;margin:6px 0">You also get a stopover option in ' + esc(v.otherHubs.join(", ")) + ' (its own free-stopover perk and transit visa, separate from ' + esc(v.city) + ' above). Check it separately.</div>');
  }
  if (v.maxDays) html.push(row("Max stay", v.maxDays + " day" + (v.maxDays > 1 ? "s" : "")));
  if (v.reasons && v.reasons.length) {
    html.push('<div class="whyhd">Before you book:</div>');
    html.push('<ul class="why">' + v.reasons.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>");
  }
  html.push('<a class="cta" href="' + programUrl(v.slug) + '" target="_blank" rel="noopener">How to book this stopover →</a>');
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
  var sel = root.querySelector(".gs-sel") as HTMLSelectElement | null;
  if (sel) sel.addEventListener("change", function () {
    editingVisa = false;
    persistPassport(sel!.value || null);
    refresh();
  });
  var ch = root.querySelector(".gs-change");
  if (ch) ch.addEventListener("click", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    editingVisa = true;
    renderBody();
  });
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
  root.querySelector(".ttl")!.textContent = current.city + " stopover";
  root.querySelector(".body")!.innerHTML = bodyHtml(current);
  wireControls();
  syncTheme();
}

function loadLiveVisa(): void {
  if (!current || !current.country) return;
  var passport = settings.passport;
  if (!passport) return;
  current.visa = { status: "loading" };
  renderBody();
  var country = current.country;
  visaLive.fetch(passport, country, function (live) {
    if (!current || current.country !== country) return;
    if ((settings.passport || null) !== passport) return;
    current.visa = live || { status: "unknown" };
    renderBody();
  });
}

// Recompute the visa verdict from the latest nationality and re-render.
function refresh(): void {
  if (!current) return;
  if (current.country) {
    current.visa = engine.visaVerdict(current.country);
  }
  current.usableHours = engine.usableHours(current.airport, current.layoverMin);
  renderBody();
  loadLiveVisa();
}

function show(v: Verdict): void {
  ensure();
  if (!root) return;
  current = v;
  editingVisa = false;
  if (v.country) v.visa = engine.visaVerdict(v.country);
  v.usableHours = engine.usableHours(v.airport, v.layoverMin);
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  renderBody();
  loadLiveVisa();
}

function riskBodyHtml(rv: RiskVerdict): string {
  var country = rv.countryLabel || (rv.country === "US" ? "US" : "Canadian");
  var multi = (rv.hubCount || 1) > 1;
  var html: string[] = [];
  html.push('<div class="conf" style="color:#dc2626">Heads up: ' + esc(rv.city) + (multi ? " are " + esc(country) + " border stops" : " is a " + esc(country) + " border stop") + "</div>");
  html.push('<div class="prog">You must clear immigration ' + (multi ? "at each stop" : "here") + ", even just to connect</div>");
  html.push('<div class="whyhd">Why this matters:</div>');
  html.push('<ul class="why">' + rv.reasons.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>");
  return html.join("");
}

function showRisk(rv: RiskVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisa = false;
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
  var color = fv.severity === "red" ? "#dc2626" : "#d97706";
  var verdict = fv.severity === "red" ? "This connection may be too short" : "This connection is tight";
  var html: string[] = [];
  html.push('<div class="conf" style="color:' + color + '">' + esc(verdict) + " at " + esc(fv.airport) + "</div>");
  html.push('<div class="prog">You have ' + esc(hm(fv.layoverMin)) + " vs a ~" + esc(hm(fv.needMin)) + " estimate</div>");
  html.push('<div class="whyhd">How that estimate is built:</div>');
  var reasons: string[] = [];
  if (fv.selfTransfer) {
    reasons.push("Separate tickets, so you must collect your bags, exit, re-check, and re-clear security, with no rebooking if the first flight is late. Budget ~" + hm(fv.needMin) + "+.");
  } else {
    reasons.push("~" + hm(fv.parts.base) + " base: deplane and walk to a different gate, and boarding closes ~20-40 min before departure.");
    if (fv.parts.intl) reasons.push("+~" + hm(fv.parts.intl) + ": international transfer, security re-screen, longer terminal walks, earlier boarding close.");
    if (fv.parts.mega) reasons.push("+~" + hm(fv.parts.mega) + ": " + esc(fv.airport) + " is a large, spread-out hub.");
  }
  reasons.push("A terminal change (e.g. T2 to T5) would add more, but the search page doesn't show terminals, so this estimate can't include it.");
  reasons.push("Conservative estimate, not the airline's official minimum connection time. If it's close, check the airline's MCT for " + esc(fv.airport) + ".");
  html.push('<ul class="why">' + reasons.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>");
  return html.join("");
}

function showFit(fv: FitVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisa = false;
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  var color = fv.severity === "red" ? "#dc2626" : "#d97706";
  (root.querySelector(".dot")! as HTMLElement).style.background = color;
  root.querySelector(".ttl")!.textContent = fv.airport + " connection";
  root.querySelector(".body")!.innerHTML = fitBodyHtml(fv);
  syncTheme();
}

function bagBodyHtml(bv: BagVerdict): string {
  var color = (bv.kind === "customs" || bv.tight) ? "#dc2626" : "#d97706";
  var ctry = bv.country === "CA" ? "Canada" : "US";
  var html: string[] = [];
  var reasons: string[] = [];
  if (bv.kind === "customs") {
    html.push('<div class="conf" style="color:' + color + '">Re-check your bags at ' + esc(bv.hub) + "</div>");
    html.push('<div class="prog">Your bags don\'t go straight to your final airport</div>');
    html.push('<div class="whyhd">What happens at ' + esc(bv.hub) + ":</div>");
    reasons.push(ctry + " customs is at your FIRST " + ctry + " airport, not your destination. At " + esc(bv.hub) + " you collect your checked bag, clear customs, re-check it, and re-clear security.");
    reasons.push("You also clear immigration here, so you need an ESTA or visa to enter.");
    reasons.push("Budget ~2-3 hours." + (bv.layoverMin != null ? " You have about " + hm(bv.layoverMin) + " here." : ""));
  } else {
    html.push('<div class="conf" style="color:' + color + '">Separate tickets: re-check your bags</div>');
    html.push('<div class="prog">Your bag is NOT checked through</div>');
    html.push('<div class="whyhd">Why this matters:</div>');
    reasons.push("These are separate tickets, so at " + esc(bv.hub || "the connection") + " you collect your bag, exit, and re-check it for the next flight.");
    reasons.push("If the first flight is late, no one re-books you and your bag won't make it, so you'd have to buy a new ticket.");
    if (bv.layoverMin != null && bv.tight) reasons.push("You have only " + hm(bv.layoverMin) + " here, which is very tight for collecting and re-checking a bag.");
  }
  html.push('<ul class="why">' + reasons.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>");
  return html.join("");
}

function showBags(bv: BagVerdict): void {
  ensure();
  if (!root) return;
  current = null;
  editingVisa = false;
  collapsed = false;
  root.querySelector(".wrap")!.setAttribute("data-collapsed", "false");
  var color = (bv.kind === "customs" || bv.tight) ? "#dc2626" : "#d97706";
  (root.querySelector(".dot")! as HTMLElement).style.background = color;
  root.querySelector(".ttl")!.textContent = (bv.hub || "Connection") + " baggage";
  root.querySelector(".body")!.innerHTML = bagBodyHtml(bv);
  syncTheme();
}

export const panel = { show: show, refresh: refresh, showRisk: showRisk, showFit: showFit, showBags: showBags };
