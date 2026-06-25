/*
 * GetStopover — curated per-hub eligibility facts NOT in the seed: fare-value
 * floors, award exclusions, advance booking deadlines, and the shortest-connection
 * rule. Sourced from each programme's published terms. Only hubs we can state
 * confidently appear here — an absent hub shows no caveat (honest under-claiming,
 * never a silent "you're fine"). The universal one-PNR / book-direct caveats are
 * emitted by the engine for every carrier-tied programme, so they're not repeated.
 */
export interface Eligibility {
  fareFloorUSD?: number;      // approx minimum base fare for the free hotel
  awardExcluded?: boolean;    // award / miles tickets don't qualify
  applyDeadlineH?: number;    // must be requested N hours before departure
  shortestConnRule?: boolean; // hotel needs the shortest same-day connection
  source?: string;
  asOf?: string;
}

export const eligibility: Record<string, Eligibility> = {
  DXB: { fareFloorUSD: 450, awardExcluded: true, applyDeadlineH: 24, shortestConnRule: true, source: "emirates.com/.../dubai-connect/terms-and-conditions/", asOf: "2026-06-23" }, // Emirates Dubai Connect (6-26h, all cabins)
  DOH: { fareFloorUSD: 400, awardExcluded: true, applyDeadlineH: 72, shortestConnRule: true, source: "qatarairways.com/tradeportal/en/policies/STPC.html", asOf: "2026-06-23" }, // Qatar STPC (free hotel 8-24h; 96h=separate paid Discover Qatar pkg)
  AUH: { awardExcluded: true, applyDeadlineH: 72 },                                             // Etihad (round-trip, EY stock)
  IST: { applyDeadlineH: 72 },                                                                  // Turkish (N/R already excluded)
  JED: { applyDeadlineH: 120 },                                                                 // Saudia (apply 5 days ahead)
  BAH: { fareFloorUSD: 450, applyDeadlineH: 24 },                                               // Gulf Air STPC
};
