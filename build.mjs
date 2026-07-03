import { build, context } from "esbuild";

const common = {
  bundle: true,
  format: "iife",
  target: "chrome110",
  legalComments: "none",
  logLevel: "info",
};

const entries = [
  { entryPoints: ["src/core/main.ts"], outfile: "dist/content.js" },
  { entryPoints: ["src/kiwi-main.ts"], outfile: "dist/kiwi-main.js" },
  { entryPoints: ["popup/popup.ts"], outfile: "dist/popup.js" },
];

if (process.argv.includes("--watch")) {
  for (const e of entries) {
    const ctx = await context({ ...common, ...e });
    await ctx.watch();
  }
  console.log("watching for changes…");
} else {
  await Promise.all(entries.map((e) => build({ ...common, ...e })));
  console.log("built dist/content.js + dist/kiwi-main.js + dist/popup.js");
}
