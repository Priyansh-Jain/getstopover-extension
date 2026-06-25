import { execSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";

const OUT = "getstopover-extension.zip";
const files = ["manifest.json", "dist", "popup/popup.html"];
if (existsSync("icons")) files.push("icons");

rmSync(OUT, { force: true });
execSync(`zip -r -q ${OUT} ${files.join(" ")} -x "*.DS_Store"`, { stdio: "inherit" });
console.log(`packaged ${OUT}: ${(statSync(OUT).size / 1024).toFixed(1)} KB (${files.join(", ")})`);
