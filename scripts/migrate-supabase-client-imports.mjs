import fs from 'node:fs';
import path from 'node:path';

const roots = ['packages', 'apps/gurudevi-mobile/src'];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const ignored = new Set(['node_modules', 'dist', '.turbo', 'reports', 'archives']);
let changed = 0;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(filePath));
    else if (extensions.has(path.extname(entry.name))) files.push(filePath);
  }
  return files;
}

for (const root of roots) {
  for (const filePath of walk(path.resolve(root))) {
    if (filePath.endsWith(`${path.sep}packages${path.sep}core${path.sep}src${path.sep}api${path.sep}index.ts`)) continue;
    const before = fs.readFileSync(filePath, 'utf8');
    let after = before
      .replaceAll("from '@repo/core/api/supabase'", "from '@repo/core/adapters/supabaseClient'")
      .replaceAll('from "@repo/core/api/supabase"', 'from "@repo/core/adapters/supabaseClient"')
      .replaceAll('__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', 'supabaseClient');

    after = after.replace(
      /import\s*\{([\s\S]*?)\}\s*from\s*(['"])@repo\/core\/api\2\s*;/g,
      (full, body, quote) => {
        const specs = body
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        const supabaseSpec = specs.find((item) => /^supabase(?:\s+as\s+\w+)?$/.test(item));
        if (!supabaseSpec) return full;

        const localName = supabaseSpec.split(/\s+as\s+/)[1] ?? 'supabase';
        const remaining = specs.filter((item) => item !== supabaseSpec);
        const coreImport = remaining.length
          ? `import { ${remaining.join(', ')} } from ${quote}@repo/core/api${quote};`
          : '';
        const adapterImport = `import { supabaseClient as ${localName} } from ${quote}@repo/core/adapters/supabaseClient${quote};`;
        return [coreImport, adapterImport].filter(Boolean).join('\n');
      },
    );

    if (after !== before) {
      try {
        fs.writeFileSync(filePath, after, 'utf8');
        changed += 1;
      } catch (error) {
        console.warn(`Skipped ${path.relative(process.cwd(), filePath)}: ${error.message}`);
      }
    }
  }
}

console.log(`Migrated Supabase client imports in ${changed} files.`);
