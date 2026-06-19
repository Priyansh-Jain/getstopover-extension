# GetStopover Chrome Extension

A Chrome extension (Manifest V3) that surfaces airline **stopover programmes** —
free multi-day layovers with a hotel and city tour — while you search flights.

The main product, getstopover.com (a Next.js app), lives in a separate repository
("Stop Over").

## Status — working prototype (v0.1)

This is a **zero-build prototype** you can load into Chrome right now. It runs on
Skyscanner, reads the route from the page URL, and shows a GetStopover panel. It is
deliberately simple so the idea is testable today — it is **not** the production
build (see "What this is / isn't" below).

## Load it in Chrome (about 30 seconds)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder: `getstopover-extension/`
5. Go to **skyscanner.net** and search any long-haul flight
   (e.g. New York → Singapore). The GetStopover panel appears bottom-right.

After editing the code, click the refresh icon on the extension card to reload.

## What it does

- Runs only on Skyscanner flight-search pages.
- Reads origin, destination and dates from the URL — no DOM scraping (the URL is
  the stable surface).
- Shows a shadow-DOM panel listing stopover programmes that could apply, with a
  link to getstopover.com.

## Project structure

```
getstopover-extension/
  manifest.json        Extension manifest (MV3)
  src/content.js           Content script — route-level panel (v1)
  src/skyscanner-cards.js  Content script — per-card stopover badges (v2)
  popup/popup.html     The toolbar popup
  preview.html         Standalone panel preview — open in any browser, no install
  README.md
```

## What this is — and isn't

This prototype is intentionally limited:

- **Vanilla JS, no build step.** The production stack should be **WXT + React +
  TypeScript** (per the research). Vanilla was chosen so this loads instantly with
  no toolchain; porting to WXT later is straightforward.
- **Bundled placeholder data.** `src/content.js` carries a hardcoded list of ~8
  programmes. The real build calls the **getstopover.com API**, so the matching
  engine and full dataset stay server-side (a "thin client" — see below).
- **Route-level guidance only.** It says "this corridor may have stopover
  options"; it does **not** yet verify a specific itinerary, fare class or
  passport. That per-itinerary eligibility verdict is the real product.

## The production path

1. Build the extension as a **thin client**: read the route → call the
   getstopover.com API → render the verdict. No matching logic in the extension.
2. Add `host_permissions` for `https://getstopover.com/*` once the API call is in.
3. Add Google Flights and Kayak after Skyscanner.
4. (Optional) port to WXT + React for a maintainable build.

## Sequencing — this is Step 3

Per the 20-agent research (`CHROME_EXTENSION_DEEP_DIVE.md`, in the main
getstopover.com repo), two things gate a real launch:

1. The eligibility-checker **web tool** on getstopover.com — the extension's
   install funnel.
2. Completing the **stopover dataset + match engine** — currently 15 of ~40
   programmes; the engine checks 3 of ~8 eligibility rules.

This prototype is fine to have and to demo. It just shouldn't be polished or
launched ahead of those two.
