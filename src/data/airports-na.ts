/*
 * GetStopover — US & Canadian airports, for the "no airside international
 * transit" warning (Reddit pain #3).
 *
 * Rule basis (official): the US (CBP) has no international sterile-transit zone —
 * every connecting passenger is admitted, so they clear immigration, reclaim and
 * re-check bags, re-clear security, and must hold US entry authorisation (ESTA or
 * visa) to even connect. Canada (CBSA) is the same in general, with narrow
 * Transit Without Visa exceptions via YVR/YYZ for specific nationalities/airlines.
 * Used only to classify origin / destination / connection airports as US|CA vs
 * foreign; membership (not completeness) is what matters, so we list commercial
 * airports we are certain of and treat anything unknown as foreign.
 */
export const naAirport: Record<string, { c: "US" | "CA"; city: string }> = {
  // --- United States ---
  ATL: { c: "US", city: "Atlanta" }, AUS: { c: "US", city: "Austin" },
  BDL: { c: "US", city: "Hartford" }, BHM: { c: "US", city: "Birmingham" },
  BNA: { c: "US", city: "Nashville" }, BOI: { c: "US", city: "Boise" },
  BOS: { c: "US", city: "Boston" }, BUF: { c: "US", city: "Buffalo" },
  BUR: { c: "US", city: "Burbank" }, BWI: { c: "US", city: "Baltimore" },
  BZN: { c: "US", city: "Bozeman" }, CHS: { c: "US", city: "Charleston" },
  CLE: { c: "US", city: "Cleveland" }, CLT: { c: "US", city: "Charlotte" },
  CMH: { c: "US", city: "Columbus" }, COS: { c: "US", city: "Colorado Springs" },
  CVG: { c: "US", city: "Cincinnati" }, DAL: { c: "US", city: "Dallas" },
  DAY: { c: "US", city: "Dayton" }, DCA: { c: "US", city: "Washington" },
  DEN: { c: "US", city: "Denver" }, DFW: { c: "US", city: "Dallas" },
  DSM: { c: "US", city: "Des Moines" }, DTW: { c: "US", city: "Detroit" },
  ELP: { c: "US", city: "El Paso" }, EWR: { c: "US", city: "Newark" },
  FAI: { c: "US", city: "Fairbanks" }, FLL: { c: "US", city: "Fort Lauderdale" },
  GEG: { c: "US", city: "Spokane" }, GRR: { c: "US", city: "Grand Rapids" },
  GSO: { c: "US", city: "Greensboro" }, GSP: { c: "US", city: "Greenville" },
  HNL: { c: "US", city: "Honolulu" }, HOU: { c: "US", city: "Houston" },
  HPN: { c: "US", city: "White Plains" }, IAD: { c: "US", city: "Washington" },
  IAH: { c: "US", city: "Houston" }, ICT: { c: "US", city: "Wichita" },
  IND: { c: "US", city: "Indianapolis" }, ITO: { c: "US", city: "Hilo" },
  JAX: { c: "US", city: "Jacksonville" }, JFK: { c: "US", city: "New York" },
  KOA: { c: "US", city: "Kona" }, LAS: { c: "US", city: "Las Vegas" },
  LAX: { c: "US", city: "Los Angeles" }, LGA: { c: "US", city: "New York" },
  LGB: { c: "US", city: "Long Beach" }, LIH: { c: "US", city: "Lihue" },
  MCI: { c: "US", city: "Kansas City" }, MCO: { c: "US", city: "Orlando" },
  MDW: { c: "US", city: "Chicago" }, MEM: { c: "US", city: "Memphis" },
  MHT: { c: "US", city: "Manchester" }, MIA: { c: "US", city: "Miami" },
  MKE: { c: "US", city: "Milwaukee" }, MSN: { c: "US", city: "Madison" },
  MSP: { c: "US", city: "Minneapolis" }, MSY: { c: "US", city: "New Orleans" },
  OAK: { c: "US", city: "Oakland" }, OGG: { c: "US", city: "Kahului" },
  OKC: { c: "US", city: "Oklahoma City" }, OMA: { c: "US", city: "Omaha" },
  ONT: { c: "US", city: "Ontario" }, ORD: { c: "US", city: "Chicago" },
  ORF: { c: "US", city: "Norfolk" }, PBI: { c: "US", city: "West Palm Beach" },
  PDX: { c: "US", city: "Portland" }, PHL: { c: "US", city: "Philadelphia" },
  PHX: { c: "US", city: "Phoenix" }, PIE: { c: "US", city: "St. Petersburg" },
  PIT: { c: "US", city: "Pittsburgh" }, PSP: { c: "US", city: "Palm Springs" },
  PVD: { c: "US", city: "Providence" }, PWM: { c: "US", city: "Portland" },
  RDU: { c: "US", city: "Raleigh-Durham" }, RIC: { c: "US", city: "Richmond" },
  RNO: { c: "US", city: "Reno" }, ROC: { c: "US", city: "Rochester" },
  RSW: { c: "US", city: "Fort Myers" }, SAN: { c: "US", city: "San Diego" },
  SAT: { c: "US", city: "San Antonio" }, SAV: { c: "US", city: "Savannah" },
  SDF: { c: "US", city: "Louisville" }, SEA: { c: "US", city: "Seattle" },
  SFB: { c: "US", city: "Orlando" }, SFO: { c: "US", city: "San Francisco" },
  SJC: { c: "US", city: "San Jose" }, SJU: { c: "US", city: "San Juan" },
  SLC: { c: "US", city: "Salt Lake City" }, SMF: { c: "US", city: "Sacramento" },
  SNA: { c: "US", city: "Santa Ana" }, SRQ: { c: "US", city: "Sarasota" },
  STL: { c: "US", city: "St. Louis" }, STT: { c: "US", city: "St. Thomas" },
  SYR: { c: "US", city: "Syracuse" }, TPA: { c: "US", city: "Tampa" },
  TUL: { c: "US", city: "Tulsa" }, TUS: { c: "US", city: "Tucson" },
  ABQ: { c: "US", city: "Albuquerque" }, ALB: { c: "US", city: "Albany" },
  ANC: { c: "US", city: "Anchorage" }, GUM: { c: "US", city: "Guam" },
  // --- Canada ---
  YYZ: { c: "CA", city: "Toronto" }, YTZ: { c: "CA", city: "Toronto" },
  YVR: { c: "CA", city: "Vancouver" }, YUL: { c: "CA", city: "Montreal" },
  YYC: { c: "CA", city: "Calgary" }, YEG: { c: "CA", city: "Edmonton" },
  YOW: { c: "CA", city: "Ottawa" }, YWG: { c: "CA", city: "Winnipeg" },
  YHZ: { c: "CA", city: "Halifax" }, YQB: { c: "CA", city: "Quebec City" },
  YYJ: { c: "CA", city: "Victoria" }, YXE: { c: "CA", city: "Saskatoon" },
  YQR: { c: "CA", city: "Regina" }, YHM: { c: "CA", city: "Hamilton" },
  YKF: { c: "CA", city: "Kitchener" }, YQM: { c: "CA", city: "Moncton" },
  YYT: { c: "CA", city: "St. John's" }, YXX: { c: "CA", city: "Abbotsford" },
  YLW: { c: "CA", city: "Kelowna" }, YYG: { c: "CA", city: "Charlottetown" },
  YZF: { c: "CA", city: "Yellowknife" }, YQT: { c: "CA", city: "Thunder Bay" },
  YQG: { c: "CA", city: "Windsor" }, YXS: { c: "CA", city: "Prince George" },
};

// US/CA airports among the card's PARSED connections (each already a real layover
// with a duration), so a 3-letter dictionary word like "DAY" in marketing text can
// never be mistaken for a Dayton connection. Foreign hubs are ignored.
export function naStopsFromConns(conns?: { code: string; min: number }[] | null): string[] {
  if (!conns) return [];
  var out: string[] = [], seen: Record<string, boolean> = {};
  for (var i = 0; i < conns.length; i++) {
    var c = conns[i].code;
    if (seen[c] || !naAirport[c]) continue;
    seen[c] = true; out.push(c);
  }
  return out;
}

// Same, but scoped to explicit stop ELEMENTS (used where layover durations aren't
// in the DOM, e.g. Skyscanner) — the codes come from stop nodes, not free text.
export function naStopsFromCodes(codes: string[], origin: string | null, dest: string | null): string[] {
  var out: string[] = [], seen: Record<string, boolean> = {};
  for (var i = 0; i < codes.length; i++) {
    var c = codes[i];
    if (seen[c] || c === origin || c === dest || !naAirport[c]) continue;
    seen[c] = true; out.push(c);
  }
  return out;
}
