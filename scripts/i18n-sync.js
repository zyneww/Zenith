#!/usr/bin/env node
// i18n-sync.js — merge missing keys from en-US.json into all other locale files
const fs = require("fs");
const path = require("path");

const MSG_DIR = path.resolve(__dirname, "..", "apps", "web", "messages");
const SOURCE = "en-US.json";

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (!(k in target)) {
      target[k] = JSON.parse(JSON.stringify(v));
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      if (typeof target[k] !== "object" || Array.isArray(target[k])) {
        target[k] = JSON.parse(JSON.stringify(v));
      } else {
        deepMerge(target[k], v);
      }
    }
  }
}

const src = JSON.parse(fs.readFileSync(path.join(MSG_DIR, SOURCE), "utf-8"));
const files = fs.readdirSync(MSG_DIR).filter(f => f.endsWith(".json") && f !== SOURCE);

for (const f of files) {
  const fp = path.join(MSG_DIR, f);
  const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
  deepMerge(data, src);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${f} — synced`);
}

console.log("\nDone. Missing keys merged from en-US.json into all locales.");
