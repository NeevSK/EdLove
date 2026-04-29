import fs from 'node:fs';
import path from 'node:path';

/**
 * --- Architectural Healer: The Sovereign Transition ---
 *
 * This script automatically fixes 'root-import' violations by re-mapping
 * symbols to their canonical subpath entry points.
 */

const ROOT = process.cwd();
const args = process.argv.slice(2);
const targetInput = args.filter((a) => !a.startsWith('--'))[0] || '.';
const isDryRun = args.includes('--dry-run');

const targetPath = path.isAbsolute(targetInput) ? targetInput : path.join(ROOT, targetInput);

console.error(`>>> 🏥 Architectural Healing in: ${targetPath}${isDryRun ? ' (DRY RUN)' : ''}`);

// --- 1. Symbol Discovery ---
const packagesToMap = [
  { name: '@repo/core', path: 'packages/core' },
  { name: '@repo/ui', path: 'packages/ui' },
];

const symbolMap = new Map(); // Symbol -> Subpath (e.g. "useStore" -> "@repo/core/store")

for (const pkg of packagesToMap) {
  const pkgDir = path.join(ROOT, pkg.path);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const exports = pkgJson.exports || {};

  for (const [subPath, target] of Object.entries(exports)) {
    if (subPath === '.' || subPath === './package.json') continue;

    const relSubPath = subPath.replace('./', '');
    const fullAlias = `${pkg.name}/${relSubPath}`;

    // Resolve the internal path (e.g. ./src/api/index.ts)
    const internalPath = typeof target === 'string' ? target : target.import || target.default;
    if (!internalPath) continue;

    const indexPath = path.join(pkgDir, internalPath);
    if (!fs.existsSync(indexPath)) continue;

    // Use a simple regex to find exports in the index file
    // Note: This is an approximation but very effective for our barrel files
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportRegex = /export\s+\{([^}]+)\}/g;
    const namedExportRegex =
      /export\s+(const|function|class|type|interface|enum)\s+([a-zA-Z0-9_$]+)/g;

    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const symbols = match[1].split(',').map((s) => s.split(' as ')[0].trim());
      symbols.forEach((s) => {
        if (s && !symbolMap.has(s)) symbolMap.set(s, fullAlias);
      });
    }

    while ((match = namedExportRegex.exec(content)) !== null) {
      const s = match[2];
      if (s && !symbolMap.has(s)) symbolMap.set(s, fullAlias);
    }
  }
}

console.error(`>>> Discovered ${symbolMap.size} symbols across subpath exports.`);

// --- 2. File Processing ---
function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        walk(fullPath, callback);
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

let fixedCount = 0;

walk(targetPath, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern: import { ... } from '@repo/core' or '@repo/ui'
  // Also matches: import type { ... } from ...
  const importRegex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"](@repo\/(?:core|ui))['"]/g;

  content = content.replace(importRegex, (fullMatch, symbolStr, alias) => {
    const symbols = symbolStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const remapped = new Map(); // Subpath -> Set of symbols

    const remainingSymbols = [];

    symbols.forEach((s) => {
      // Handle "Symbol as Alias"
      const name = s.split(/\s+as\s+/)[0].trim();
      const subPath = symbolMap.get(name);

      if (subPath?.startsWith(alias)) {
        if (!remapped.has(subPath)) remapped.set(subPath, new Set());
        remapped.get(subPath).add(s);
      } else {
        remainingSymbols.push(s);
      }
    });

    if (remapped.size === 0) return fullMatch;

    changed = true;
    const newImports = [];

    // Group re-mapped symbols
    for (const [subPath, symSet] of remapped.entries()) {
      const isType = fullMatch.includes('import type');
      newImports.push(
        `import ${isType ? 'type ' : ''}{ ${Array.from(symSet).join(', ')} } from '${subPath}';`,
      );
    }

    // Keep symbols that couldn't be re-mapped in the root (though there shouldn't be many if discovery is good)
    if (remainingSymbols.length > 0) {
      newImports.push(
        `import ${fullMatch.includes('import type') ? 'type ' : ''}{ ${remainingSymbols.join(', ')} } from '${alias}';`,
      );
    }

    return newImports.join('\n');
  });

  if (changed) {
    fixedCount++;
    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.error(`✅ Healed: ${path.relative(ROOT, filePath)}`);
    } else {
      console.error(`🔍 [DRY RUN] Would heal: ${path.relative(ROOT, filePath)}`);
    }
  }
});

console.log(`\nArchitecural Healing complete.`);
console.log(`Scanned: ${targetPath}`);
console.log(`Healed: ${fixedCount} files.`);
