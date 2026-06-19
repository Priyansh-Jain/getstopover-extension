/*
 * GetStopover — content script (prototype v0.1)
 *
 * Runs on Skyscanner flight-search pages, reads the route from the URL, and
 * shows a panel noting that the trip may qualify for an airline stopover
 * programme (free hotel + city tour in the connecting hub city).
 *
 * PROTOTYPE SCOPE
 *   - Uses the bundled STOPOVER_PROGRAMS list below (placeholder data).
 *   - Gives route-level guidance only — it does not yet evaluate a specific
 *     itinerary, fare class or passport.
 *   - The production version should call the getstopover.com API instead and
 *     return a real per-itinerary eligibility verdict. See README.md.
 */

(() => {
  "use strict";

  /* --- Placeholder dataset -------------------------------------------------
   * In the real build this is replaced by a call to the getstopover.com API
   * (the matching engine and full dataset live server-side).
   */
  const STOPOVER_PROGRAMS = [
    { airline: "Turkish Airlines",   hub: "Istanbul",  perk: "Free hotel (1–2 nights) + Touristanbul city tour" },
    { airline: "Qatar Airways",      hub: "Doha",      perk: "Stopover hotel from about US$14 per night" },
    { airline: "Emirates",           hub: "Dubai",     perk: "Dubai Connect — free hotel on eligible long layovers" },
    { airline: "Etihad",             hub: "Abu Dhabi", perk: "Abu Dhabi stopover — up to 2 free hotel nights" },
    { airline: "Finnair",            hub: "Helsinki",  perk: "Free Helsinki stopover, up to 5 days" },
    { airline: "Icelandair",         hub: "Reykjavik", perk: "Iceland stopover at no extra airfare, up to 7 days" },
    { airline: "TAP Air Portugal",   hub: "Lisbon",    perk: "Lisbon or Porto stopover, up to 5 nights" },
    { airline: "Singapore Airlines", hub: "Singapore", perk: "Singapore stopover hotel & voucher deals" }
  ];

  const PANEL_ID = "getstopover-panel-host";
  const SITE_URL = "https://getstopover.com/?utm_source=extension&utm_medium=skyscanner";

  /* --- Route parsing -------------------------------------------------------
   * Skyscanner flight URLs look like:
   *   /transport/flights/{origin}/{destination}/{YYMMDD}/{YYMMDD?}/
   */
  function parseRoute() {
    const m = location.pathname.match(
      /\/transport\/flights\/([a-z0-9-]+)\/([a-z0-9-]+)\/(\d{6})(?:\/(\d{6}))?/i
    );
    if (!m) return null;
    return {
      origin: m[1].toUpperCase(),
      destination: m[2].toUpperCase(),
      departDate: formatYYMMDD(m[3]),
      returnDate: m[4] ? formatYYMMDD(m[4]) : null
    };
  }

  function formatYYMMDD(s) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yy = Number(s.slice(0, 2));
    const mm = Number(s.slice(2, 4));
    const dd = Number(s.slice(4, 6));
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    return dd + " " + months[mm - 1] + " 20" + String(yy).padStart(2, "0");
  }

  /* --- Panel --------------------------------------------------------------- */
  const PANEL_CSS = `
    :host { all: initial; }
    * { box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card {
      width: 320px; background: #fff; color: #0f172a;
      border: 1px solid #e6e8ec; border-radius: 14px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, .18);
      padding: 16px 16px 14px; position: relative;
    }
    .close {
      position: absolute; top: 8px; right: 10px; border: 0;
      background: transparent; cursor: pointer; font-size: 20px;
      line-height: 1; color: #94a3b8;
    }
    .close:hover { color: #0f172a; }
    .brand { font-size: 13px; font-weight: 700; color: #4f46e5; }
    .tag {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      background: #eef2ff; color: #4f46e5; padding: 2px 6px;
      border-radius: 999px; margin-left: 4px; letter-spacing: .5px;
    }
    .route { margin-top: 8px; font-size: 16px; font-weight: 700; }
    .muted { font-weight: 500; color: #64748b; font-size: 13px; }
    .lede { margin: 8px 0 10px; font-size: 12.5px; line-height: 1.5; color: #334155; }
    .programs { list-style: none; margin: 0 0 12px; padding: 0; }
    .programs li { font-size: 12px; padding: 7px 0; border-top: 1px solid #f1f5f9; }
    .programs li:first-child { border-top: 0; }
    .perk { color: #64748b; }
    .cta {
      display: block; text-align: center; text-decoration: none;
      background: #4f46e5; color: #fff; font-size: 13px; font-weight: 600;
      padding: 10px 12px; border-radius: 10px;
    }
    .cta:hover { background: #4338ca; }
    .note { margin: 10px 0 0; font-size: 10.5px; line-height: 1.45; color: #94a3b8; }
  `;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
    ));
  }

  function panelHtml(route) {
    const dates = route.returnDate
      ? escapeHtml(route.departDate + " – " + route.returnDate)
      : (route.departDate ? escapeHtml(route.departDate) : "");

    const programItems = STOPOVER_PROGRAMS.slice(0, 4).map((p) => (
      "<li><strong>" + escapeHtml(p.airline) + "</strong> · " + escapeHtml(p.hub) +
      "<br><span class=\"perk\">" + escapeHtml(p.perk) + "</span></li>"
    )).join("");

    return "<style>" + PANEL_CSS + "</style>" +
      "<div class=\"card\">" +
        "<button class=\"close\" title=\"Dismiss\">×</button>" +
        "<div class=\"brand\">✈ GetStopover <span class=\"tag\">prototype</span></div>" +
        "<div class=\"route\">" + escapeHtml(route.origin) + " → " +
          escapeHtml(route.destination) +
          (dates ? " · <span class=\"muted\">" + dates + "</span>" : "") +
        "</div>" +
        "<p class=\"lede\">Long-haul trips like this can often be routed through a " +
          "hub city for a <strong>free multi-day stopover</strong> — hotel and " +
          "city tour included — at little or no extra airfare.</p>" +
        "<ul class=\"programs\">" + programItems + "</ul>" +
        "<a class=\"cta\" href=\"" + SITE_URL + "\" target=\"_blank\" rel=\"noopener\">" +
          "Check if your trip qualifies →</a>" +
        "<p class=\"note\">Prototype — route-level guidance only. The full version " +
          "checks your exact itinerary, fare class and passport.</p>" +
      "</div>";
  }

  function renderPanel(route) {
    let host = document.getElementById(PANEL_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = PANEL_ID;
      host.style.cssText =
        "position:fixed;bottom:20px;right:20px;z-index:2147483647;display:block;";
      (document.body || document.documentElement).appendChild(host);
    }
    if (!host.shadowRoot) host.attachShadow({ mode: "open" });
    host.shadowRoot.innerHTML = panelHtml(route);

    const close = host.shadowRoot.querySelector(".close");
    if (close) {
      close.addEventListener("click", () => {
        dismissedForUrl = location.href;
        removePanel();
      });
    }
  }

  function removePanel() {
    const host = document.getElementById(PANEL_ID);
    if (host) host.remove();
  }

  /* --- Watch for searches (Skyscanner is a single-page app) ---------------- */
  let lastUrl = null;
  let dismissedForUrl = null;

  function tick() {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      dismissedForUrl = null; // a new search — allow the panel again
    }
    const route = parseRoute();
    if (!route || url === dismissedForUrl) {
      removePanel();
      return;
    }
    if (!document.getElementById(PANEL_ID)) {
      renderPanel(route);
    }
  }

  tick();
  setInterval(tick, 1200);
  window.addEventListener("popstate", tick);
})();
