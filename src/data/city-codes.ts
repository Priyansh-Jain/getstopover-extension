import { programs } from "./programs";
import { naAirport } from "./airports-na";

var map: Record<string, string> = {};
programs.forEach(function (p) { map[p.city.toLowerCase()] = p.airport; });
for (var code in naAirport) {
  var c = naAirport[code].city.toLowerCase();
  if (!map[c]) map[c] = code;
}

var WORLD: Record<string, string> = {
  "frankfurt": "FRA", "amsterdam": "AMS", "zurich": "ZRH", "munich": "MUC", "rome": "FCO",
  "paris": "CDG", "london": "LHR", "madrid": "MAD", "barcelona": "BCN", "vienna": "VIE",
  "warsaw": "WAW", "brussels": "BRU", "milan": "MXP", "copenhagen": "CPH", "oslo": "OSL",
  "stockholm": "ARN", "dublin": "DUB", "manchester": "MAN", "athens": "ATH", "geneva": "GVA",
  "hong kong": "HKG", "tokyo": "HND", "osaka": "KIX", "shanghai": "PVG", "beijing": "PEK",
  "guangzhou": "CAN", "taipei": "TPE", "jakarta": "CGK", "manila": "MNL", "ho chi minh city": "SGN",
  "cairo": "CAI", "nairobi": "NBO", "casablanca": "CMN", "johannesburg": "JNB",
  "sao paulo": "GRU", "mexico city": "MEX", "panama city": "PTY", "bogota": "BOG",
};
for (var w in WORLD) if (!map[w]) map[w] = WORLD[w];

export function cityToCode(name: string | null | undefined): string | null {
  if (!name) return null;
  return map[name.trim().toLowerCase()] || null;
}
