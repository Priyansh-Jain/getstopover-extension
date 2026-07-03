# GetStopover Extension — Testing Task List

Why this exists: for this extension the **verdict correctness IS the product** (a wrong eligibility/connection call erodes the trust the whole pitch rests on). Failures cluster into exactly two layers, so the testing effort is targeted there, not spread into a full pyramid:

1. **Verdict logic** (`engine`, `fit`, `risk`, `bags`, `usableHours`) — pure, DOM-independent, high-consequence regressions.
2. **Adapters** (`parseCard` per site) — the fragile layer that silently rots when host sites rename their DOM.

Full live end-to-end is deliberately **out of scope** (bot-blockers + constant DOM churn = flaky, high-maintenance, low ROI for a solo project). Acceptance confidence comes from local fixtures instead.

---

## P1 — Setup
- [ ] Add `vitest` + `happy-dom` as devDependencies
- [ ] Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`
- [ ] `tests/` dir + `vitest.config` (happy-dom environment for adapter tests)

## P1 — Unit tests: verdict logic (pure, fast, highest value)
- [ ] `engine.evaluateCard` — amber vs grey paths, carrier match / no-match suppression, self-transfer ineligible, tour-vs-hotel window selection, multi-hub primary + `otherHubs`
- [ ] **Regression:** lock in the GREEN path once the "engine never emits green" bug is fixed (carrier-agnostic airport tour that fits → green)
- [ ] `fit.evaluate` — red/amber thresholds, `AMBER_MARGIN`, self-transfer override (`SELF_XFER`), intl + mega bumps, picks worst connection
- [ ] `risk.evaluate` — US/CA transit detection, tight-layover (<150m) flag, origin/dest-is-NA exclusion
- [ ] `bags.evaluate` — separate-ticket vs customs branches
- [ ] `usableHours` — net math, confident-traveler trim, 60-min buffer floor, null on unreadable layover
- [ ] carrier token matcher — "Air China" must NOT cross-match "China Southern / China Eastern"; exact IATA-code match
- [ ] `visaVerdict` — per-passport status mapping (free/voa/evisa/required), `no-passport` and `unknown` fallbacks

## P2 — Integration tests: adapters (DOM fixture → Card; guards against silent rot)
- [ ] Capture one real HTML snapshot per site into `tests/fixtures/` (skyscanner, google, kayak, expedia, trip, kiwi)
- [ ] `parseCard(fixture)` → assert the `Card` (stops, layovers, carriers, selfTransfer, naStops, connections, origin/dest)
- [ ] Cover the Skyscanner detail-itinerary path ("between flights" layover parsing) separately from the collapsed card
- [ ] Note: fixtures catch regressions in OUR parsing, not when the live site changes under us — the runtime `skipRot`/rot self-check + a periodic manual smoke test cover that gap

## P3 — Render / component test: chip + panel
- [ ] Formalize the chip harness (load the real `badge.ts` / `panel.ts` against mock cards, served on localhost, driven by Playwright)
- [ ] Assert: no chip ↔ logo/route overlap, no text truncation at narrow card widths, inline padding clears content, Kayak bottom placement doesn't cover price/CTA
- [ ] Assert: panel renders, header collapses/expands, passport picker recomputes the visa row

## Deferred — live E2E acceptance (NOT now)
- [ ] SKIP full live E2E against real sites (Skyscanner PerimeterX block + 6 sites' constant DOM churn = perpetually flaky)
- [ ] If acceptance confidence is needed: load the unpacked extension against LOCAL HTML fixtures on localhost, never live sites
- [ ] Keep a periodic MANUAL smoke test (or lightweight monitoring ping) as the real-world rot detector

---

## Notes
- Runner choice: Vitest fits the existing esbuild/TS/ESM setup, runs both the pure unit tests and the happy-dom adapter tests fast; Playwright (already used) handles the render test.
- Sequencing: P1 unit tests pair naturally with the verdict-logic fixes (the green-path fix, the calibrated confidence header), so build the regression tests alongside those changes.
- Related: see the 9-item bug list and the feature roadmap from the test/research passes for what the P1/P3 tests should lock in.
