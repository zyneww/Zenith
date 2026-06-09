#!/usr/bin/env bun
// Final clean patch: make every page async, accept params, call setRequestLocale

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
let updated = 0;

for (const p of pages) {
  let src = readFileSync(p, "utf8");

  // 1) Ensure setRequestLocale import
  if (!src.includes("from \"next-intl/server\"")) {
    src = src.replace(/^(import .+ from .+;\n)/m, '$1import { setRequestLocale } from "next-intl/server";\n');
  } else if (!src.match(/import \{[^}]*\bsetRequestLocale\b[^}]*\} from "next-intl\/server";/)) {
    src = src.replace(
      /import \{([^}]*)\} from "next-intl\/server";?/,
      (m, names) => `import { ${names.trim()}, setRequestLocale } from "next-intl/server";`
    );
  }

  // 2) Find and rewrite the default export
  // Match: export default [async] function Name(...args) {
  const re = /export default (async )?function (\w+)\(([^)]*)\)\s*\{/;
  if (re.test(src)) {
    src = src.replace(re, (m, isAsync, name, args) => {
      const cleanArgs = args.trim();
      // Always make async, always add params with locale
      const newSig = `export default async function ${name}(${cleanArgs ? cleanArgs + ", " : ""}params: Promise<{ locale: string }>) {`;
      const localeSet = "\n  const { locale } = await params;\n  setRequestLocale(locale);\n";
      return newSig + localeSet;
    });
    updated++;
  }

  writeFileSync(p, src);
}

console.log(`Updated ${updated} pages.`);
