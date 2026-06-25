import type { Card, RiskVerdict } from "../types";
import { naAirport } from "../data/airports-na";

function isCode(s: string | undefined): boolean {
  return !!s && /^[A-Z]{3}$/.test(s);
}

function fmtHm(min: number): string {
  var h = Math.floor(min / 60), m = min % 60;
  return h ? (h + "h" + (m ? " " + m + "m" : "")) : (m + "m");
}

function evaluate(card: Card | null): RiskVerdict | null {
  if (!card || !card.naStops || !card.naStops.length) return null;
  if (!isCode(card.origin) || !isCode(card.dest)) return null;
  if (naAirport[card.origin as string] || naAirport[card.dest as string]) return null;

  var hub = card.naStops[0];
  var na = naAirport[hub];
  if (!na) return null;

  var lay: number | null = null;
  if (card.connections) {
    for (var k = 0; k < card.connections.length; k++) {
      if (card.connections[k].code === hub) { lay = card.connections[k].min; break; }
    }
  }
  var tight = lay != null && lay < 150;

  var reasons: string[] = [];
  if (tight) reasons.push("You'd have only about " + fmtHm(lay as number) + " here, which is very tight for clearing immigration, reclaiming and re-checking bags, and re-screening.");
  if (na.c === "US") {
    reasons.push("The US has no airside international transit. Even though you're only connecting, you must clear US immigration (CBP), collect your checked bags, re-check them, and re-clear security.");
    reasons.push("You need US entry authorisation just to connect here: an ESTA (visa-waiver countries) or a US visa. Without it the first airline can deny you boarding.");
    reasons.push("Budget 2-3 hours for the connection. A short layover here is high-risk for misconnecting.");
  } else {
    reasons.push("Canada has no general airside international transit. You normally clear Canadian immigration (CBSA), collect and re-check your bags, then re-clear security.");
    reasons.push("You usually need a Canadian eTA (visa-exempt nationals) or a visa to connect. Narrow Transit Without Visa exceptions exist for some nationalities via Vancouver and Toronto.");
    reasons.push("Budget 2-3 hours for the connection. A short layover here is high-risk for misconnecting.");
  }

  return {
    kind: na.c === "US" ? "us-transit" : "ca-transit", country: na.c, airport: hub, city: na.city,
    layoverMin: tight ? (lay as number) : undefined, reasons: reasons,
  };
}

export const risk = { evaluate: evaluate };
