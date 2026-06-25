import type { VisaApiResponse, VisaInfo, VisaStatus } from "../types";

const ENDPOINT = "https://www.getstopover.com/api/visa/check";
const TTL_MS = 7 * 86400000;

const COUNTRY_ISO: Record<string, string> = {
  "Bahrain": "BH", "Brunei": "BN", "China": "CN", "Colombia": "CO", "Egypt": "EG",
  "Ethiopia": "ET", "Finland": "FI", "Iceland": "IS", "Japan": "JP", "Jordan": "JO",
  "Mexico": "MX", "Panama": "PA", "Poland": "PL", "Portugal": "PT", "Qatar": "QA",
  "Rwanda": "RW", "Saudi Arabia": "SA", "Singapore": "SG", "South Korea": "KR",
  "Sri Lanka": "LK", "Turkey": "TR", "United Arab Emirates": "AE", "Vietnam": "VN",
};

function isoFor(country: string | null | undefined): string | null {
  if (!country) return null;
  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
  return COUNTRY_ISO[country] || null;
}

function toStatus(visa: VisaApiResponse["visa"] | null | undefined): VisaStatus | null {
  if (!visa) return null;
  if (visa.transit_visa_free) return "free";
  if (visa.visa_on_arrival) return "voa";
  if (visa.e_visa_available) return "evisa";
  if (visa.visa_required) return "required";
  return null;
}

function readCache(key: string, cb: (v: VisaInfo | null) => void): void {
  try {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) { cb(null); return; }
    chrome.storage.local.get([key], function (res: Record<string, any>) {
      var hit = res && res[key];
      cb(hit && hit.t && (Date.now() - hit.t) < TTL_MS ? hit.v : null);
    });
  } catch (e) { cb(null); }
}

function writeCache(key: string, value: VisaInfo): void {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      var o: Record<string, { t: number; v: VisaInfo }> = {};
      o[key] = { t: Date.now(), v: value };
      chrome.storage.local.set(o);
    }
  } catch (e) { /* ignore */ }
}

function fetchVisa(passport: string, country: string, cb: (v: VisaInfo | null) => void): void {
  var iso = isoFor(country);
  if (!passport || !iso) { cb(null); return; }
  var key = "visa:v2:" + passport + ":" + iso;
  readCache(key, function (cached) {
    if (cached) { cb(cached); return; }
    var url = ENDPOINT + "?country=" + encodeURIComponent(country) + "&passport=" + encodeURIComponent(passport);
    fetch(url, { credentials: "omit", signal: AbortSignal.timeout(6000) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json: VisaApiResponse | null) {
        var visa = json && json.found && json.visa ? json.visa : null;
        var status = toStatus(visa);
        if (!status || !visa) { cb(null); return; }
        var out: VisaInfo = { status: status, notes: visa.notes || "", maxTransitHours: visa.max_transit_hours || null, live: true };
        writeCache(key, out);
        cb(out);
      })
      .catch(function () { cb(null); });
  });
}

export const visaLive = { fetch: fetchVisa };
