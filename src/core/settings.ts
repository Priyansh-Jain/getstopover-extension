/*
 * GetStopover — user settings (chrome.storage.local), shared via the settings export.
 *
 *   confidentTraveler -> trims the airport return-buffer in the usable-hours calc.
 *   passport          -> 2-letter nationality for the per-passport transit-visa
 *                        verdict. Captured once in the popup.
 *
 * Defaults are synchronous so the engine never reads undefined; stored values
 * load async and re-render, and popup changes apply live via storage.onChanged.
 */
import type { Settings } from "../types";

const TRIM_MIN = 30;

export const settings: Settings = { confidentTraveler: false, bufferAdjustMin: 0, passport: null };

export function applyConfident(c: unknown): void {
  settings.confidentTraveler = !!c;
  settings.bufferAdjustMin = c ? -TRIM_MIN : 0;
}

export function applyPassport(p: unknown): void {
  settings.passport = (p as string) || null;
}

export function loadSettings(onChange: () => void): void {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["confidentTraveler", "passport"], function (res) {
        applyConfident(res && res.confidentTraveler);
        applyPassport(res && res.passport);
        onChange();
      });
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== "local") return;
        if (changes.confidentTraveler) applyConfident(changes.confidentTraveler.newValue);
        if (changes.passport) applyPassport(changes.passport.newValue);
        onChange();
      });
    }
  } catch (e) { /* storage unavailable; defaults stand */ }
}
