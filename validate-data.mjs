import { build } from "esbuild";
import { unlinkSync } from "node:fs";

const TMP = "./_data.gen.mjs";
await build({
  stdin: {
    contents: 'export { programs } from "./src/data/programs"; export { eligibility } from "./src/data/eligibility";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  outfile: TMP,
  bundle: true,
  format: "esm",
  logLevel: "silent",
});
const { programs, eligibility } = await import("./_data.gen.mjs");
unlinkSync(TMP);

const errors = [];
const warns = [];

for (const p of programs) {
  if (p.minH != null && p.maxH != null) {
    if (p.maxH > 720) errors.push(`${p.airport} (${p.airline}): maxH ${p.maxH}h > 720h (30d) — certainly a stay-days mis-entry`);
    else if (p.maxH > 240) warns.push(`${p.airport} (${p.airline}): maxH ${p.maxH}h > 240h — long window, re-verify it isn't a stay-days mis-entry`);
    if (p.minH < 1) errors.push(`${p.airport} (${p.airline}): minH ${p.minH} < 1`);
    if (p.minH > p.maxH) errors.push(`${p.airport} (${p.airline}): minH ${p.minH} > maxH ${p.maxH}`);
  }
}

for (const [hub, e] of Object.entries(eligibility)) {
  if (e.fareFloorUSD != null && (e.fareFloorUSD < 50 || e.fareFloorUSD > 2000)) errors.push(`${hub}: fareFloorUSD ${e.fareFloorUSD} out of [50,2000]`);
  if (e.applyDeadlineH != null && (e.applyDeadlineH < 1 || e.applyDeadlineH > 336)) errors.push(`${hub}: applyDeadlineH ${e.applyDeadlineH} out of [1,336]`);
  if (!e.source || !e.asOf) warns.push(`${hub}: missing provenance (source/asOf) — verify against the official page before relying on its gates`);
}

warns.forEach((w) => console.warn("WARN  " + w));
errors.forEach((e) => console.error("FAIL  " + e));
console.log(`validate-data: ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
