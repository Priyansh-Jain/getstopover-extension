/*
 * GetStopover — connection-fit check (Reddit pain #4: "will I make this connection?").
 *
 * needMin is COMPOSED from named overheads rather than a flat floor: a domestic
 * deplane-and-walk base, plus an international-transfer penalty (security re-screen,
 * longer terminal walks, earlier international boarding close), plus an allowance for
 * very large / spread-out hubs. Separate tickets override (collect + re-check, no
 * rebooking). These are CONSERVATIVE estimates, not official MCTs; terminal-change
 * time can't be added because the results page doesn't expose terminals. We only warn
 * (amber/red) and stay silent when comfortable, so we never give a false "you're fine".
 */
import type { Card, FitVerdict } from "../types";
import { country } from "../data/airport-country";

var DOMESTIC_BASE = 40; // deplane + walk to a different gate + boarding closes early
var INTL_OVERHEAD = 20; // international transfer: re-screen, longer walk, earlier close
var MEGA_BUMP = 10;     // large/spread hub — a proxy for terminal distance (terminals aren't on the card)
var SELF_XFER = 150;    // separate tickets: collect bags, exit, re-check, re-clear, no protection
var AMBER_MARGIN = 20;

// Genuinely large / busy hubs where a short connection is materially riskier.
var megaHubs: Record<string, boolean> = {
  ATL:true, ORD:true, DFW:true, IAH:true, DEN:true, LAX:true, SFO:true, JFK:true, EWR:true,
  MIA:true, CLT:true, PHX:true, SEA:true, LAS:true, MCO:true, BOS:true, MSP:true, DTW:true,
  PHL:true, LGA:true, FLL:true, IAD:true, BWI:true, SLC:true, SAN:true, HNL:true,
  YYZ:true, YVR:true, YUL:true, YYC:true,
  LHR:true, LGW:true, MAN:true, CDG:true, ORY:true, FRA:true, MUC:true, AMS:true, MAD:true,
  BCN:true, FCO:true, MXP:true, ZRH:true, VIE:true, CPH:true, ARN:true, OSL:true, HEL:true,
  DUB:true, BRU:true, LIS:true, IST:true, SAW:true, ATH:true,
  DXB:true, AUH:true, DOH:true, JED:true, RUH:true, KWI:true, TLV:true, CAI:true,
  DEL:true, BOM:true, BLR:true, MAA:true, HYD:true, CCU:true,
  PEK:true, PKX:true, PVG:true, CAN:true, SZX:true, CTU:true, HKG:true, TPE:true,
  ICN:true, GMP:true, NRT:true, HND:true, KIX:true, SIN:true, BKK:true, DMK:true, KUL:true,
  CGK:true, MNL:true, SGN:true, HAN:true,
  SYD:true, MEL:true, BNE:true, PER:true, AKL:true,
  GRU:true, GIG:true, EZE:true, SCL:true, BOG:true, LIM:true, MEX:true, CUN:true, PTY:true,
  JNB:true, CPT:true, NBO:true, ADD:true, LOS:true, CMN:true,
};

// A connection is international when its hub sits in a different country from an
// endpoint (an adjacent leg crosses a border). Falls back to "the whole trip is
// international" when the hub's country is unknown, and to domestic when neither is.
function isIntl(card: Card, code: string): boolean {
  var ch = country(code), co = country(card.origin), cd = country(card.dest);
  if (ch) {
    if (co && ch !== co) return true;
    if (cd && ch !== cd) return true;
    if (co && cd) return false;
  }
  return !!(co && cd && co !== cd);
}

function evaluate(card: Card | null): FitVerdict | null {
  if (!card || !card.connections || !card.connections.length) return null;
  var selfTransfer = !!card.selfTransfer;
  var worst: FitVerdict | null = null;
  for (var i = 0; i < card.connections.length; i++) {
    var c = card.connections[i];
    if (c.min == null || c.min <= 0) continue;
    var intl = isIntl(card, c.code);
    var mega = !!megaHubs[c.code];
    var parts = selfTransfer
      ? { base: SELF_XFER, intl: 0, mega: 0 }
      : { base: DOMESTIC_BASE, intl: intl ? INTL_OVERHEAD : 0, mega: mega ? MEGA_BUMP : 0 };
    var need = parts.base + parts.intl + parts.mega;
    var sev: "red" | "amber" | null = null;
    if (c.min < need) sev = "red";
    else if (c.min < need + AMBER_MARGIN) sev = "amber";
    if (!sev) continue;
    if (!worst || (sev === "red" && worst.severity === "amber")) {
      worst = { severity: sev, airport: c.code, layoverMin: c.min, needMin: need, selfTransfer: selfTransfer, intl: intl, mega: mega, parts: parts };
    }
  }
  return worst;
}

export const fit = { evaluate: evaluate };
