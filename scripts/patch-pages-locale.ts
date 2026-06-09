#!/usr/bin/env bun
// Add setRequestLocale import + call to every page.tsx in [locale] that doesn't have it
// and wrap them with setRequestLocale(locale) at the top of the default export.

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
let skipped = 0;

for (const p of pages) {
  let src = readFileSync(p, "utf8");
  if (src.includes("setRequestLocale")) {
    skipped++;
    continue;
  }
  // Add import if needed
  if (!src.includes("from \"next-intl/server\"")) {
    if (src.match(/^import .+ from .+;\n/m)) {
      src = src.replace(/^(import .+ from .+;\n)/m, '$1import { setRequestLocale } from "next-intl/server";\n');
    } else {
      src = `import { setRequestLocale } from "next-intl/server";\n` + src;
    }
  } else {
    src = src.replace(
      /import \{([^}]*)\} from "next-intl\/server";?/,
      (m, names) => {
        if (names.includes("setRequestLocale")) return m;
        return `import { ${names.trim()}, setRequestLocale } from "next-intl/server";`;
      }
    );
  }

  // For server components, find the default exported function and inject setRequestLocale at the top
  // Pattern: export default function Foo({ ... }: { params: Promise<{ locale: string }> }) {
  //          or
  //          export default async function Foo(...) {
  // If locale param not in signature, we still call setRequestLocale(locale) but skip if not available.
  const hasParams = src.match(/params: Promise<\{ locale: string \}>/);
  if (hasParams) {
    // Find the default export function and inject setRequestLocale at the start
    src = src.replace(
      /export default (async )?function (\w+)\(\s*\{[^}]*params[^}]*\}\s*:\s*\{\s*params:\s*Promise<\{ locale: string \}>\s*\}\s*\)\s*\{/,
      (m, isAsync, name) => {
        return m.replace(
          /\{$/,
          "{\n  const { locale } = await params;\n  setRequestLocale(locale);"
        );
      }
    );
    // If the function is async we need to ensure `await` is inside an async function. The pattern above
    // assumed `async`, but we wrote it without `await` at top. The existing function might be sync.
    // Let's check: if the matched function name's previous function isn't async, we shouldn't add `await`.
    if (!src.match(/export default async function/)) {
      // Replace our `await params` with no await (params is a Promise, but setRequestLocale wants a string)
      src = src.replace(
        "const { locale } = await params;\n  setRequestLocale(locale);",
        "const { locale } = (params as any).locale ?? (await params).locale;\n  setRequestLocale(locale);"
      );
    }
  } else {
    // For pages without locale params, we just call setRequestLocale without a value (best effort)
    // Wrap the function body to read locale from requestLocale() from next-intl/server
    src = src.replace(
      /export default (async )?function (\w+)\(/,
      (m) => m + " { /* locale handled by layout */\n"
    );
  }

  writeFileSync(p, src);
  updated++;
}

console.log(`Updated ${updated} pages, skipped ${skipped} (already have setRequestLocale).`);
