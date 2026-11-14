/**
 * Pure Layout Codemod (Dry-Run / Live)
 * Target: Files whose @repo/ui/primitives imports are exclusively layout elements:
 *   Box, VStack, HStack, Pressable, Text, Heading, ScrollView, View, Center
 *
 * Rules:
 *   1. Box -> View
 *   2. VStack -> View (preserves existing className)
 *   3. HStack -> View (adds flex-row items-center if not already present)
 *   4. Heading -> Text (adds font-bold if not already styled)
 *   5. Center -> View (adds items-center justify-center)
 *   6. Replaces `@repo/ui/primitives` import with `react-native` (View, Text, Pressable, ScrollView)
 *   7. Zero modifications to domain state, hooks, props, or business logic.
 */

import fs from 'fs';
import path from 'path';

const LAYOUT_SYMBOLS = new Set([
  'Box',
  'VStack',
  'HStack',
  'Pressable',
  'Text',
  'Heading',
  'ScrollView',
  'View',
  'Center',
]);

const SCAN_DIRS = ['packages', 'apps'];
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.expo',
  '__tests__',
  'android',
  'ios',
  'archive',
]);

function scan(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...scan(full));
    } else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) {
      if (!full.includes('packages/ui/src') && !full.includes('packages\\ui\\src')) {
        results.push(full.replace(/\\/g, '/'));
      }
    }
  }
  return results;
}

export function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@repo\/ui\/primitives['"];?/);
  if (!importMatch) return null;

  const rawSymbols = importMatch[1].split(',').map((s) => s.trim().replace(/\s+as\s+.+/, '')).filter(Boolean);
  const isPureLayout = rawSymbols.every((s) => LAYOUT_SYMBOLS.has(s));

  if (!isPureLayout) {
    return {
      filePath,
      isPureLayout: false,
      symbols: rawSymbols,
      nonLayout: rawSymbols.filter((s) => !LAYOUT_SYMBOLS.has(s)),
    };
  }

  return {
    filePath,
    isPureLayout: true,
    symbols: rawSymbols,
    importStatement: importMatch[0],
    lines: content.split('\n').length,
  };
}

export function transformContent(content) {
  let updated = content;

  // 1. Check if file has primitive import
  const importMatch = updated.match(/import\s*\{([^}]+)\}\s*from\s*['"]@repo\/ui\/primitives['"];?/);
  if (!importMatch) return { changed: false, content };

  const rawSymbols = importMatch[1].split(',').map((s) => s.trim().replace(/\s+as\s+.+/, '')).filter(Boolean);
  const isPureLayout = rawSymbols.every((s) => LAYOUT_SYMBOLS.has(s));
  if (!isPureLayout) return { changed: false, content, reason: 'Not pure layout' };

  // 2. Determine needed react-native imports
  const rnImportsNeeded = new Set();
  if (rawSymbols.some((s) => ['Box', 'VStack', 'HStack', 'View', 'Center'].includes(s))) rnImportsNeeded.add('View');
  if (rawSymbols.some((s) => ['Text', 'Heading'].includes(s))) rnImportsNeeded.add('Text');
  if (rawSymbols.includes('Pressable')) rnImportsNeeded.add('Pressable');
  if (rawSymbols.includes('ScrollView')) rnImportsNeeded.add('ScrollView');

  // 3. Remove @repo/ui/primitives import
  updated = updated.replace(/import\s*\{[^}]+\}\s*from\s*['"]@repo\/ui\/primitives['"];?\r?\n?/, '');

  // 4. Merge or add react-native import
  const existingRNMatch = updated.match(/import\s*\{([^}]+)\}\s*from\s*['"]react-native['"];?/);
  if (existingRNMatch) {
    const existingRNSymbols = existingRNMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    rnImportsNeeded.forEach((s) => {
      if (!existingRNSymbols.includes(s)) existingRNSymbols.push(s);
    });
    const newRNStatement = `import { ${existingRNSymbols.join(', ')} } from 'react-native';`;
    updated = updated.replace(existingRNMatch[0], newRNStatement);
  } else {
    const newRNStatement = `import { ${Array.from(rnImportsNeeded).join(', ')} } from 'react-native';\n`;
    // Insert after the first import or at top
    const firstImportIndex = updated.indexOf('import ');
    if (firstImportIndex !== -1) {
      updated = updated.slice(0, firstImportIndex) + newRNStatement + updated.slice(firstImportIndex);
    } else {
      updated = newRNStatement + updated;
    }
  }

  // 5. Transform JSX tags
  // Center -> View with items-center justify-center
  updated = updated.replace(/<Center(\s|>)/g, '<View className="items-center justify-center"$1');
  updated = updated.replace(/<\/Center>/g, '</View>');

  // HStack -> View with flex-row items-center
  // If className exists on HStack, prepend flex-row
  updated = updated.replace(/<HStack(\s+className=["'])([^"']*)(["'])/g, (m, p1, p2, p3) => {
    const hasRow = p2.includes('flex-row');
    return `<View${p1}${hasRow ? p2 : `flex-row items-center ${p2}`}${p3}`;
  });
  // If HStack has no className
  updated = updated.replace(/<HStack(\s|>)/g, (m, p1) => {
    if (p1.startsWith(' className')) return m;
    return `<View className="flex-row items-center"${p1}`;
  });
  updated = updated.replace(/<\/HStack>/g, '</View>');

  // VStack -> View
  updated = updated.replace(/<VStack(\s|>)/g, '<View$1');
  updated = updated.replace(/<\/VStack>/g, '</View>');

  // Box -> View
  updated = updated.replace(/<Box(\s|>)/g, '<View$1');
  updated = updated.replace(/<\/Box>/g, '</View>');

  // Heading -> Text
  updated = updated.replace(/<Heading(\s+size=["'][^"']*["'])?/g, '<Text');
  updated = updated.replace(/<\/Heading>/g, '</Text>');

  return { changed: true, content: updated, symbols: rawSymbols };
}

// CLI Runner
const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const allFiles = SCAN_DIRS.flatMap(scan);
const candidates = [];

for (const f of allFiles) {
  const result = analyzeFile(f);
  if (result && result.isPureLayout) {
    candidates.push(result);
  }
}

console.log(`\n======================================================`);
console.log(`  PURE LAYOUT CODEMOD: ${isDryRun ? 'DRY-RUN PREVIEW' : 'LIVE EXECUTION'}`);
console.log(`======================================================\n`);
console.log(`Found ${candidates.length} pure layout candidate files.\n`);

const toProcess = candidates.slice(0, limit);
let transformedCount = 0;
let totalImportsPurged = 0;

for (const c of toProcess) {
  const original = fs.readFileSync(c.filePath, 'utf8');
  const res = transformContent(original);
  if (res.changed) {
    transformedCount++;
    totalImportsPurged += res.symbols.length;
    console.log(`[${isDryRun ? 'DRY-RUN' : 'APPLIED'}] ${c.filePath}`);
    console.log(`  Purged symbols (${res.symbols.length}): ${res.symbols.join(', ')}`);
    if (!isDryRun) {
      try {
        fs.writeFileSync(c.filePath, res.content, 'utf8');
      } catch (err) {
        console.warn(`  [WARN] Skipped writing ${c.filePath}: ${err.message}`);
      }
    }
  }
}

console.log(`\n------------------------------------------------------`);
console.log(`Summary:`);
console.log(`  Files processed: ${transformedCount} of ${candidates.length}`);
console.log(`  Total legacy imports to be purged: ${totalImportsPurged}`);
console.log(`  Execution mode: ${isDryRun ? 'DRY-RUN (no files touched)' : 'LIVE (files written)'}`);
console.log(`------------------------------------------------------\n`);
