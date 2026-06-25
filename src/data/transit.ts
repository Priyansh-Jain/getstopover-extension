/*
 * GetStopover — per-hub transit overheads for the "usable city hours" calc (#2).
 *
 * usableMin = layoverMin - exit - (2 x toCity) - buffer
 *   exit   : landing -> out of the airport (arrival immigration + walk), one time
 *   toCity : airport -> city centre, one way (doubled for the return)
 *   buffer : conservative time to be back inside the terminal before the onward
 *            INTERNATIONAL departure (re-clear immigration + security re-screen +
 *            walk + gate-close margin + contingency)
 *
 * Buffer basis (researched, June 2026): every major hub publishes "arrive ~3h
 * before international departures" (Dubai/DXB 3h, gates close 25 min before;
 * Istanbul/IST 3h; Doha/Hamad 3h), while efficient hubs run ~2.5h (Singapore
 * Changi: 2.5h, 2h if checked in online). We default to the CONSERVATIVE end
 * because over-estimating usable hours can mean a missed flight. A through-checked
 * transit passenger skips check-in, so the "I'm a confident traveller" toggle
 * (src/core/settings.ts) shaves 30 min off every buffer.
 *   180 = large/slow/variable   165 = standard intl hub   150 = compact/efficient
 *
 * exit/toCity remain ground-transport estimates; refine over time.
 */
import type { TransitInfo } from "../types";

export const transit: Record<string, TransitInfo> = {
  IST: { exit: 40, toCity: 50, buffer: 180 }, // Istanbul — large, slow, 3h advised
  KEF: { exit: 30, toCity: 50, buffer: 150 }, // Reykjavik/Keflavik — compact
  DOH: { exit: 35, toCity: 25, buffer: 165 }, // Doha/Hamad — 3h advised, fast security
  DXB: { exit: 40, toCity: 30, buffer: 180 }, // Dubai — 3h advised, gates close 25m
  LIS: { exit: 30, toCity: 25, buffer: 150 }, // Lisbon — compact
  SIN: { exit: 30, toCity: 25, buffer: 150 }, // Singapore Changi — efficient, 2.5h
  ADD: { exit: 40, toCity: 30, buffer: 165 }, // Addis Ababa
  HEL: { exit: 25, toCity: 35, buffer: 150 }, // Helsinki — efficient
  AUH: { exit: 40, toCity: 45, buffer: 180 }, // Abu Dhabi
  BWN: { exit: 30, toCity: 20, buffer: 150 }, // Bandar Seri Begawan — small
  ICN: { exit: 35, toCity: 60, buffer: 165 }, // Seoul/Incheon
  NRT: { exit: 35, toCity: 75, buffer: 165 }, // Tokyo/Narita
  PTY: { exit: 35, toCity: 30, buffer: 150 }, // Panama City
  BAH: { exit: 30, toCity: 20, buffer: 150 }, // Manama/Bahrain — small
  JED: { exit: 40, toCity: 30, buffer: 165 }, // Jeddah
  CAN: { exit: 40, toCity: 50, buffer: 180 }, // Guangzhou — large
  PEK: { exit: 45, toCity: 55, buffer: 180 }, // Beijing — large, slow
  CAI: { exit: 45, toCity: 40, buffer: 180 }, // Cairo — slow processing
  AMM: { exit: 35, toCity: 45, buffer: 165 }, // Amman
  CMB: { exit: 35, toCity: 45, buffer: 165 }, // Colombo
  PVG: { exit: 40, toCity: 55, buffer: 180 }, // Shanghai/Pudong — large
  KGL: { exit: 35, toCity: 20, buffer: 150 }, // Kigali — small
  HAN: { exit: 40, toCity: 45, buffer: 165 }, // Hanoi
  SGN: { exit: 40, toCity: 35, buffer: 165 }, // Ho Chi Minh City
  HAK: { exit: 35, toCity: 25, buffer: 150 }, // Haikou — small
  WAW: { exit: 25, toCity: 25, buffer: 150 }, // Warsaw — compact
  BOG: { exit: 40, toCity: 40, buffer: 180 }, // Bogota — slow processing
  MEX: { exit: 45, toCity: 45, buffer: 180 }, // Mexico City — large, slow
  _default: { exit: 40, toCity: 45, buffer: 165 },
};
