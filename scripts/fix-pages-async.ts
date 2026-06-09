#!/usr/bin/env bun
// Final clean fix: remove "undefinedfunction" corruption, replace with "async function"
// and remove the broken @ts-expect-error lines

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
  if (!src.includes("undefinedfunction")) continue;

  // 1) Replace "undefinedfunction" with "async function"
  src = src.replace(/export default undefinedfunction /g, "export default async function ");

  // 2) Replace the broken @ts-expect-error block
  src = src.replace(
    /\s*\/\/ @ts-expect-error Async server component\s*\n\s*const \{ locale \} = \(params as any\)\.locale \?\? \(await params\)\.locale;\s*\n\s*setRequestLocale\(locale\);/,
    "\n  const { locale } = await params;\n  setRequestLocale(locale);"
  );

  writeFileSync(p, src);
  fixed++;
}

console.log(`Fixed ${fixed} pages.`);
