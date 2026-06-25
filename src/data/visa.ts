/*
 * GetStopover — bundled per-passport visa-requirement lookup (on-device).
 * AUTO-GENERATED from the Stop Over app seed/visa-requirements.json on 2026-06-21.
 * GS.visa[PASSPORT_CODE][hubCountry] = { req, transitFree, voa, eVisa, maxH, notes }.
 * Nationality is captured once in the popup and stays on-device (chrome.storage.local).
 */
import type { VisaSeed } from "../types";

export const visa: Record<string, Record<string, VisaSeed>> = {
    "US": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      }
    },
    "GB": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "IN": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa-on-arrival needs a confirmed hotel or an eligible US/UK/Schengen/GCC visa or residence; not free-transit by default"
      },
      "United Arab Emirates": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa required, available online or on arrival for some"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": 96,
        "notes": "96h visa-free transit (VFTF) needs an onward ticket and a valid US/UK/AU/CA/DE/JP/NZ/CH visa. Otherwise a visa is required"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "K-ETA required, available online"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa on arrival available"
      }
    },
    "CN": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 96,
        "notes": "30-day visa-free entry (China-Singapore mutual exemption)"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "A C-3 tourist visa is required"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "DE": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "AU": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "CA": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa-free for up to 14 days"
      }
    },
    "FR": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "JP": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa-free for up to 14 days"
      }
    },
    "KR": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "BR": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "MX": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "RU": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 1440,
        "notes": "Visa-free for up to 60 days"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": 96,
        "notes": "96h visa-free transit (VFTF, as a CIS national) needs an onward ticket and a valid US/UK/AU/CA/DE/JP/NZ/CH visa. Otherwise a visa is required"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "Visa-free for up to 60 days (K-ETA required)"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "NL": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "SE": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "IT": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "ES": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "NZ": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "SG": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days (ASEAN)"
      }
    },
    "IE": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "ZA": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "United Arab Emirates": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa required, e-visa available"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "PH": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "No visa-on-arrival for Philippine passports; an advance e-visa is required"
      },
      "United Arab Emirates": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa required, apply online"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 96,
        "notes": "Visa-free for up to 30 days (ASEAN)"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "A C-3 tourist visa is required"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days (ASEAN)"
      }
    },
    "TH": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": false,
        "voa": true,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa-free 30 days but conditional: Thai passports must book accommodation through Discover Qatar and show sufficient funds; not free-transit by default"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa-free for up to 14 days (ASEAN)"
      }
    },
    "ID": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "United Arab Emirates": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa required, apply online"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "A C-3 tourist visa is required"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days (ASEAN)"
      }
    },
    "MY": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days (ASEAN)"
      }
    },
    "TR": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "SA": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 96,
        "notes": "Not eligible for visa-free transit. A Singapore visa must be arranged in advance"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "Visa-free entry (K-ETA-exempt)"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for short stays"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "Saudi Arabia": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "AE": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Domestic - no visa needed"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days (Schengen)"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "Saudi Arabia": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for GCC nationals"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    },
    "PL": {
      "Turkey": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Iceland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Schengen member - free movement"
      },
      "Qatar": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "United Arab Emirates": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Portugal": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "Singapore": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": true,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa or visa on arrival available"
      },
      "Finland": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "EU/Schengen - free movement"
      },
      "South Korea": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Japan": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 2160,
        "notes": "Visa-free for up to 90 days"
      },
      "Panama": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 4320,
        "notes": "Visa-free for up to 180 days"
      },
      "Bahrain": {
        "req": false,
        "transitFree": true,
        "voa": true,
        "eVisa": false,
        "maxH": 336,
        "notes": "Visa on arrival for up to 14 days"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available for tourism"
      },
      "Brunei": {
        "req": false,
        "transitFree": true,
        "voa": false,
        "eVisa": false,
        "maxH": 720,
        "notes": "Visa-free for up to 30 days"
      }
    },
    "NG": {
      "Turkey": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, available online"
      },
      "Iceland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Qatar": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Not visa-exempt; the online Hayya e-visa is closed to Nigerian passports, so a visa must be arranged via an accredited agent"
      },
      "United Arab Emirates": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "Visa required, apply online"
      },
      "Portugal": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "Singapore": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 96,
        "notes": "Not eligible for Singapore's visa-free transit. A visa is required"
      },
      "Ethiopia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa required, apply online before travel"
      },
      "Finland": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Schengen visa required"
      },
      "South Korea": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": 72,
        "notes": "A C-3 tourist visa is required"
      },
      "Japan": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Panama": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required"
      },
      "Bahrain": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": true,
        "maxH": null,
        "notes": "E-visa available online"
      },
      "Saudi Arabia": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      },
      "Brunei": {
        "req": true,
        "transitFree": false,
        "voa": false,
        "eVisa": false,
        "maxH": null,
        "notes": "Visa required, apply at embassy"
      }
    }
};
