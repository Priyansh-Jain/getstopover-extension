/*
 * GetStopover — checked-bag re-check verdict (Reddit pain #2: "do I collect and
 * re-check my bag at the connection?"). Warns only on the two factual cases that
 * otherwise show nothing:
 *   separate = self-transfer / separate tickets -> bag is NOT through-checked.
 *   customs  = single ticket arriving into the US/Canada -> customs is at your FIRST
 *              US/CA airport (not your destination), so you reclaim + re-check there.
 * A normal through-ticket connection stays silent (no false "you're fine"). The
 * foreign->foreign US/CA transit case is already covered by the transit chip (risk.ts).
 */
import type { BagVerdict, Card } from "../types";
import { country } from "../data/airport-country";
import { naAirport } from "../data/airports-na";

function layoverAt(card: Card, code: string | null): number | undefined {
  if (!code || !card.connections) return undefined;
  for (var i = 0; i < card.connections.length; i++) if (card.connections[i].code === code) return card.connections[i].min;
  return undefined;
}

function firstConn(card: Card): string | null {
  if (card.connections && card.connections.length) return card.connections[0].code;
  if (card.naStops && card.naStops.length) return card.naStops[0];
  if (card.stops && card.stops.length) return card.stops[0];
  return null;
}

function evaluate(card: Card | null): BagVerdict | null {
  if (!card) return null;
  var anyConn = (card.connections && card.connections.length) ||
    (card.naStops && card.naStops.length) || (card.stops && card.stops.length);
  if (!anyConn) return null;

  if (card.selfTransfer) {
    var hub = firstConn(card);
    var lay = layoverAt(card, hub);
    return { kind: "separate", hub: hub, layoverMin: lay, tight: lay != null && lay < 150 };
  }

  var co = country(card.origin), cd = country(card.dest);
  if (co && cd && co !== "US" && co !== "CA" && (cd === "US" || cd === "CA") && card.naStops && card.naStops.length) {
    var h = card.naStops[0];
    var na = naAirport[h];
    if (na) return { kind: "customs", hub: h, country: na.c, layoverMin: layoverAt(card, h), tight: true };
  }
  return null;
}

export const bags = { evaluate: evaluate };
