#!/usr/bin/env bun
// Fix the broken function signatures created by patch-pages-locale.ts

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const LOCALE_ROOT = "/home/we/Documents/CODE/ZENITH/apps/web/app/[locale]";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === "page.tsx") out.push(full);
  }
  return out;
}

const pages = walk(LOCALE_ROOT);
let fixed = 0;

for (const p of pages) {
  let src = readFileSync(p, "utf8");
  if (!src.includes("locale handled by layout")) continue;

  // Fix pattern: `export default function Foo( { /* locale handled by layout */\n) {` -> `export default function Foo() {`
  src = src.replace(
    /export default (async )?function (\w+)\( \{ \/\* locale handled by layout \*\/\n\) \{/g,
    "export default $1function $2() {"
  );

  // Remove unused setRequestLocale import if function never uses it
  if (!src.includes("setRequestLocale(") && src.includes("import { setRequestLocale } from \"next-intl/server\";")) {
    src = src.replace(/import \{ setRequestLocale \} from "next-intl\/server";\n/g, "");
  }

  writeFileSync(p, src);
  fixed++;
}

console.log(`Fixed ${fixed} pages.`);
