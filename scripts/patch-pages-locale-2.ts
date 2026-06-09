#!/usr/bin/env bun
// Add setRequestLocale + params to every page in [locale]

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
  // Skip if already has setRequestLocale AND params
  if (src.includes("setRequestLocale(") && /params:.*locale/.test(src)) continue;

  // 1) Ensure import exists
  if (!src.includes("from \"next-intl/server\"")) {
    src = src.replace(/^(import .+ from .+;\n)/m, '$1import { setRequestLocale } from "next-intl/server";\n');
  } else if (!src.includes("setRequestLocale }")) {
    src = src.replace(
      /import \{([^}]*)\} from "next-intl\/server";?/,
      (m, names) => `import { ${names.trim()}, setRequestLocale } from "next-intl/server";`
    );
  }

  // 2) Modify the default export
  // Case A: has `params: Promise<{ locale: string }>` (or similar) - just inject the call
  if (/params:.*Promise<\{[^}]*locale[^}]*\}>/.test(src)) {
    src = src.replace(
      /(export default (?:async )?function (\w+)\([^)]*\)\s*\{)/,
      (m, p1, p2) => {
        // Check if next line already has locale destructuring
        if (src.includes("const { locale } = await params")) {
          return p1 + "\n  setRequestLocale(locale);";
        }
        return p1 + `\n  const { locale } = await params;\n  setRequestLocale(locale);`;
      }
    );
  } else {
    // Case B: no params at all - add params to signature and call setRequestLocale
    src = src.replace(
      /export default (async )?function (\w+)\(([^)]*)\)\s*\{/,
      (m, isAsync, name, args) => {
        const isAsyncFn = !!isAsync;
        const cleanArgs = args.trim();
        const newArgs = cleanArgs ? `{ ${cleanArgs}, params }: { ${cleanArgs}; params: Promise<{ locale: string }> }` : `{ params }: { params: Promise<{ locale: string }> }`;
        const callLine = isAsyncFn
          ? `\n  const { locale } = await params;\n  setRequestLocale(locale);`
          : `\n  // @ts-expect-error Async server component\n  const { locale } = (params as any).locale ?? (await params).locale;\n  setRequestLocale(locale);`;
        return `export default ${isAsync}function ${name}(${newArgs}) {${callLine}`;
      }
    );
  }

  writeFileSync(p, src);
  updated++;
  console.log(`✓ ${p.split("/").slice(-3).join("/")}`);
}

console.log(`\nUpdated ${updated} pages.`);
