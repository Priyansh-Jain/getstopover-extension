/*
 * GetStopover — Skyscanner per-card badges (v2 prototype)
 *
 * Stamps a stopover badge onto Skyscanner flight-result cards whose
 * connection is a known stopover hub. Each badge deep-links to that hub's
 * programme page on getstopover.com.
 *
 * Built against Skyscanner's real DOM (captured May 2026). Selectors anchor on
 * stable hooks — the `data-testid="ticket"` attribute and CSS-module component
 * prefixes via `[class*="..."]` — which survive Skyscanner's per-build class
 * hashing. Layered fallbacks included.
 *
 * Logs "[GetStopover]" lines to the console.
 */

(() => {
  "use strict";

  // Known stopover hubs — IATA code -> programme info + getstopover.com slug.
  // PLACEHOLDER: the real build pulls this from the getstopover.com API.
  // Slugs are the real ones from the main repo's seed/programs.json.
  const HUBS = {
    IST: { city: "Istanbul",     airline: "Turkish Airlines",   slug: "turkish-airlines-istanbul-stopover" },
    DOH: { city: "Doha",         airline: "Qatar Airways",      slug: "qatar-airways-doha-stopover" },
    DXB: { city: "Dubai",        airline: "Emirates",           slug: "emirates-dubai-connect" },
    AUH: { city: "Abu Dhabi",    airline: "Etihad",             slug: "etihad-abu-dhabi-stopover" },
    HEL: { city: "Helsinki",     airline: "Finnair",            slug: "finnair-helsinki-stopover" },
    KEF: { city: "Reykjavik",    airline: "Icelandair",         slug: "icelandair-iceland-stopover" },
    LIS: { city: "Lisbon",       airline: "TAP Air Portugal",   slug: "tap-portugal-stopover" },
    SIN: { city: "Singapore",    airline: "Singapore Airlines", slug: "singapore-airlines-free-tour" },
    ADD: { city: "Addis Ababa",  airline: "Ethiopian Airlines", slug: "ethiopian-airlines-addis-ababa-stopover" },
    BAH: { city: "Bahrain",      airline: "Gulf Air",           slug: "gulf-air-bahrain-stopover" },
    PTY: { city: "Panama City",  airline: "Copa Airlines",      slug: "copa-airlines-panama-stopover" },
    ICN: { city: "Seoul",        airline: "Korean Air",         slug: "korean-air-seoul-stopover" },
    NRT: { city: "Tokyo",        airline: "Japan Airlines",     slug: "japan-airlines-stopover" },
    BWN: { city: "Brunei",       airline: "Royal Brunei",       slug: "royal-brunei-stopover" },
    JED: { city: "Jeddah",       airline: "Saudia",             slug: "saudia-saudi-stopover" }
  };

  // Hub codes as standalone tokens — for the text-scan fallback only.
  const HUB_PATTERNS = Object.keys(HUBS).map((code) => ({
    code: code,
    re: new RegExp("(^|[^A-Z])" + code + "([^A-Z]|$)")
  }));

  const PROGRAM_URL = "https://getstopover.com/programs/";
  const FALLBACK_URL = "https://getstopover.com/";
  const UTM = "?utm_source=extension&utm_medium=skyscanner-badge";
  const BADGE_ATTR = "data-getstopover-badge";

  // --- Find flight cards ----------------------------------------------------
  function findCards() {
    let cards = document.querySelectorAll('[data-testid="ticket"]');
    if (cards.length) return Array.from(cards);
    cards = document.querySelectorAll('[class*="FlightsTicket_container"]');
    return Array.from(cards);
  }

  // --- The connecting hub for a card, if any --------------------------------
  function detectHub(cardEl) {
    // Primary: the stop-airport code lives in its own element.
    const stopEls = cardEl.querySelectorAll(
      '[class*="Stops_stopsTooltip"], [class*="Stops_stopStation"]'
    );
    for (const el of stopEls) {
      const code = (el.textContent || "").trim().toUpperCase();
      if (code.length === 3 && HUBS[code]) {
        return Object.assign({ code: code }, HUBS[code]);
      }
    }
    // Fallback: scan the card's spaced text for any hub code as a token.
    const text = spacedText(cardEl);
    for (const h of HUB_PATTERNS) {
      if (h.re.test(text)) return Object.assign({ code: h.code }, HUBS[h.code]);
    }
    return null;
  }

  function spacedText(el) {
    let out = "";
    try {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const v = n.nodeValue;
        if (v && v.trim()) out += v.trim() + " ";
      }
    } catch (e) {
      out = el.textContent || "";
    }
    return out;
  }

  // --- Inject the badge -----------------------------------------------------
  function addBadge(cardEl, hub) {
    if (cardEl.querySelector("[" + BADGE_ATTR + "]")) return;
    try {
      if (getComputedStyle(cardEl).position === "static") {
        cardEl.style.position = "relative";
      }
    } catch (e) { /* ignore */ }

    // Deep-link straight to this hub's programme page.
    const url = hub.slug ? PROGRAM_URL + hub.slug + UTM : FALLBACK_URL + UTM;

    const badge = document.createElement("div");
    badge.setAttribute(BADGE_ATTR, "1");
    badge.title = "Connects through " + hub.city + " — see the " + hub.airline +
      " stopover programme on GetStopover.";
    badge.textContent = "✈ Free stopover · " + hub.city;
    badge.style.cssText = [
      "position:absolute", "top:8px", "left:8px", "z-index:99999",
      "background:#4f46e5", "color:#fff",
      "font:600 11px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
      "padding:4px 9px", "border-radius:999px", "cursor:pointer",
      "box-shadow:0 2px 8px rgba(15,23,42,.25)", "white-space:nowrap",
      "letter-spacing:.2px"
    ].join(";");
    badge.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      window.open(url, "_blank", "noopener");
    });
    cardEl.appendChild(badge);
  }

  // --- Scan loop ------------------------------------------------------------
  function scan() {
    if (!/\/transport\/flights\//.test(location.pathname)) return;
    let cards;
    try { cards = findCards(); } catch (e) { return; }
    let badged = 0;
    for (const card of cards) {
      try {
        const hub = detectHub(card);
        if (hub) { addBadge(card, hub); badged++; }
      } catch (e) { /* skip this card */ }
    }
    console.log("[GetStopover] flight cards: " + cards.length +
                "  |  badged (stopover hub): " + badged);
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; scan(); }, 700);
  }

  try {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (e) { /* ignore */ }
  setInterval(schedule, 3000);
  schedule();
})();
