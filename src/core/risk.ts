import type { Card, RiskVerdict } from "../types";
import { naAirport } from "../data/airports-na";

function isCode(s: string | undefined): boolean {
  return !!s && /^[A-Z]{3}$/.test(s);
}

function fmtHm(min: number): string {
  var h = Math.floor(min / 60), m = min % 60;
  return h ? (h + "h" + (m ? " " + m + "m" : "")) : (m + "m");
}

interface Hub {
  code: string;
  city: string;
  country: "US" | "CA";
  lay: number | null;
  tight: boolean;
}

function evaluate(card: Card | null): RiskVerdict | null {
  if (!card || !card.naStops || !card.naStops.length) return null;
  if (!isCode(card.origin) || !isCode(card.dest)) return null;
  if (naAirport[card.origin as string] || naAirport[card.dest as string]) return null;

  var hubs: Hub[] = [], seen: Record<string, boolean> = {};
  for (var i = 0; i < card.naStops.length; i++) {
    var code = card.naStops[i];
    if (seen[code]) continue;
    var na = naAirport[code];
    if (!na) continue;
    seen[code] = true;
    var lay: number | null = null;
    if (card.connections) {
      for (var k = 0; k < card.connections.length; k++) {
        if (card.connections[k].code === code) { lay = card.connections[k].min; break; }
      }
    }
    hubs.push({ code: code, city: na.city, country: na.c, lay: lay, tight: lay != null && lay < 150 });
  }
  if (!hubs.length) return null;

  var first = hubs[0];
  var multi = hubs.length > 1;
  var hasUS = false, hasCA = false;
  hubs.forEach(function (h) { if (h.country === "US") hasUS = true; else hasCA = true; });

  var reasons: string[] = [];
  hubs.forEach(function (h) {
    if (h.tight) reasons.push("You'd have only about " + fmtHm(h.lay as number) + " at " + h.city + " (" + h.code + "), which is very tight for clearing immigration, reclaiming and re-checking bags, and re-screening.");
  });
  if (hasUS) {
    reasons.push("The US has no airside international transit. Even though you're only connecting, you must clear US immigration (CBP), collect your checked bags, re-check them, and re-clear security.");
    reasons.push("You need US entry authorisation just to connect here: an ESTA (visa-waiver countries) or a US visa. Without it the first airline can deny you boarding.");
  }
  if (hasCA) {
    reasons.push("Canada has no general airside international transit. You normally clear Canadian immigration (CBSA), collect and re-check your bags, then re-clear security.");
    reasons.push("You usually need a Canadian eTA (visa-exempt nationals) or a visa to connect. Narrow Transit Without Visa exceptions exist for some nationalities via Vancouver and Toronto.");
  }
  reasons.push(multi
    ? "Budget 2-3 hours for each of these connections. A short layover is high-risk for misconnecting."
    : "Budget 2-3 hours for the connection. A short layover here is high-risk for misconnecting.");

  var cities = hubs.map(function (h) { return h.city; });
  var cityLabel = cities.length === 1 ? cities[0]
    : cities.slice(0, -1).join(", ") + " and " + cities[cities.length - 1];

  var stopsLabel, tightNote, countryLabel;
  if (multi) {
    var cl = hasUS && hasCA ? "US/Canada" : hasUS ? "US" : "Canada";
    stopsLabel = cityLabel + ", " + cl + " border stops";
    countryLabel = hasUS && hasCA ? "US and Canadian" : hasUS ? "US" : "Canadian";
    var tights = hubs.filter(function (h) { return h.tight; });
    if (tights.length === 1) tightNote = "only " + fmtHm(tights[0].lay as number) + " at " + tights[0].code + ", very tight";
    else if (tights.length > 1) tightNote = "very tight at " + tights.map(function (h) { return h.code; }).join(" & ");
  }

  return {
    kind: first.country === "US" ? "us-transit" : "ca-transit", country: first.country,
    airport: first.code, city: cityLabel,
    layoverMin: !multi && first.tight ? (first.lay as number) : undefined,
    hubLayoverMin: !multi && first.lay != null ? first.lay : undefined, reasons: reasons,
    hubCount: hubs.length, stopsLabel: stopsLabel, tightNote: tightNote, countryLabel: countryLabel,
  };
}

export const risk = { evaluate: evaluate };
