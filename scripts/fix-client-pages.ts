#!/usr/bin/env bun
// Remove setRequestLocale from "use client" pages (they can't use server-only API)

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
  // Only process "use client" pages
  if (!src.trimStart().startsWith('"use client"') && !src.includes('\n"use client"\n')) continue;
  if (!src.includes("setRequestLocale")) continue;

  // 1) Remove the setRequestLocale import
  src = src.replace(/import \{([^}]*)\} from "next-intl\/server";?\n?/g, "");

  // 2) Remove the params destructure and setRequestLocale call inside the function
  // Pattern: const { locale } = await params;\n  setRequestLocale(locale);\n
  src = src.replace(/\s*const \{ locale \} = await params;\s*\n\s*setRequestLocale\(locale\);\s*\n?/g, "\n");

  // 3) Simplify the function signature: remove the params arg we added
  // Pattern: function Name({ params }: { params: ... })
  // Keep as is since params is still useful (or remove if not used)
  // We can just leave the function as `function Name()` if it no longer uses params

  writeFileSync(p, src);
  fixed++;
}

console.log(`Fixed ${fixed} client pages.`);
