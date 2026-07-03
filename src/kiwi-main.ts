/*
 * GetStopover — Kiwi main-world bridge.
 *
 * Kiwi's result cards hold the full itinerary (per-connection layover seconds,
 * station codes, carriers, pnrCount) only in React fiber expandos on the card
 * elements. Those are page-world JavaScript properties, invisible to the
 * extension's isolated-world content script. This script is declared with
 * "world": "MAIN" for kiwi.com only: it walks the fibers read-only and hands
 * the facts to the content script via a data attribute, since DOM attributes
 * are shared between worlds. If React internals change and nothing is found,
 * it stamps nothing and the adapter falls back to its grey text parse.
 */

(function () {
  var ATTR = "data-gs-kiwi";
  document.documentElement.setAttribute("data-gs-kiwi-bridge", "1");

  function fiberOf(el: Element): unknown {
    var keys = Object.keys(el);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf("__reactFiber$") === 0) return (el as unknown as Record<string, unknown>)[keys[i]];
    }
    return null;
  }

  function itineraryFor(el: HTMLElement): any {
    var probe = el.querySelector('[data-test="ResultCardStopPlace"]') || el;
    var f = fiberOf(probe) as any;
    var hops = 0;
    while (f && hops < 40) {
      var p = f.memoizedProps;
      if (p && p.itinerary && (p.itinerary.outbound || p.itinerary.sector)) return p.itinerary;
      f = f.return;
      hops++;
    }
    return null;
  }

  function stationCode(end: any): string | null {
    var code = end && end.station ? end.station.code : null;
    return typeof code === "string" && /^[A-Z]{3}$/.test(code) ? code : null;
  }

  function legFacts(leg: any, out: { conns: { code: string; min: number }[]; carriers: string[] }): { origin: string | null; dest: string | null } {
    var origin: string | null = null, dest: string | null = null;
    if (!leg || !leg.sectorSegments || !leg.sectorSegments.length) return { origin: origin, dest: dest };
    var ss = leg.sectorSegments;
    for (var i = 0; i < ss.length; i++) {
      var seg = ss[i] && ss[i].segment;
      if (!seg) continue;
      var src = stationCode(seg.source);
      var dst = stationCode(seg.destination);
      if (i === 0) origin = src;
      if (dst) dest = dst;
      [seg.carrier, seg.operatingCarrier].forEach(function (c: any) {
        var name = c && typeof c.name === "string" ? c.name.trim() : "";
        if (name && name.length > 1 && name.length < 40 && out.carriers.indexOf(name) === -1 && out.carriers.length < 8) {
          out.carriers.push(name);
        }
      });
      var lay = ss[i].layover;
      if (lay && typeof lay.duration === "number" && lay.duration > 0 && src) {
        var min = Math.round(lay.duration / 60);
        if (min > 0 && min < 60000) out.conns.push({ code: src, min: min });
      }
    }
    return { origin: origin, dest: dest };
  }

  function extract(itin: any): string | null {
    var acc = { conns: [] as { code: string; min: number }[], carriers: [] as string[] };
    var ob = legFacts(itin.outbound || itin.sector, acc);
    legFacts(itin.inbound, acc);
    if (!ob.origin && !ob.dest && !acc.conns.length) return null;
    var selfTransfer = false;
    if (typeof itin.pnrCount === "number" && itin.pnrCount > 1) selfTransfer = true;
    if (itin.travelHack && itin.travelHack.isVirtualInterlining) selfTransfer = true;
    return JSON.stringify({
      origin: ob.origin, dest: ob.dest, conns: acc.conns, carriers: acc.carriers, selfTransfer: selfTransfer,
    });
  }

  function stampAll(): void {
    var cards = document.querySelectorAll('[data-test="ResultCardWrapper"]');
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i] as HTMLElement;
      try {
        var itin = itineraryFor(el);
        if (!itin) continue;
        var json = extract(itin);
        if (!json) continue;
        if (el.getAttribute(ATTR) !== json) el.setAttribute(ATTR, json);
      } catch (e) { /* ignore */ }
    }
  }

  setInterval(stampAll, 1200);
  stampAll();
})();
