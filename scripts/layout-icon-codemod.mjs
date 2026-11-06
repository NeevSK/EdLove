/**
 * Layout + Icon Codemod (Dry-Run / Live)
 * Target: Non-web files whose @repo/ui/primitives imports are layout elements plus Icon:
 *   Box, VStack, HStack, Pressable, Text, Heading, ScrollView, View, Center, Icon
 *
 * Rules:
 *   1. Layout transformations:
 *      Box -> View
 *      VStack -> View (preserves existing className)
 *      HStack -> View (flex-row items-center)
 *      Heading -> Text
 *      Center -> View (items-center justify-center)
 *   2. Icon transformations:
 *      <Icon as={Foo} size="xs" ... /> -> <Foo size={12} ... />
 *      <Icon as={Foo} size="sm" ... /> -> <Foo size={16} ... />
 *      <Icon as={Foo} size="md" ... /> -> <Foo size={20} ... />
 *      <Icon as={Foo} size="lg" ... /> -> <Foo size={24} ... />
 *      <Icon as={Foo} size={18} ... /> -> <Foo size={18} ... />
 *      <Icon as={Foo} ... /> (no size)  -> <Foo size={16} ... />
 *   3. Removes Icon and layout symbols from `@repo/ui/primitives` import
 *   4. Adds needed react-native imports (View, Text, Pressable, ScrollView)
 *   5. Preserves all domain hooks, state, callbacks, and props intact.
 */

import fs from 'fs';
import path from 'path';

const LAYOUT_AND_ICON = new Set([
  'Box',
  'VStack',
  'HStack',
  'Pressable',
  'Text',
  'Heading',
  'ScrollView',
  'View',
  'Center',
  'Icon',
]);

const SIZE_MAP = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function transformContent(content) {
  let updated = content;

  // 1. Check if file has primitive import
  const importMatch = updated.match(/import\s*\{([^}]+)\}\s*from\s*['"]@repo\/ui\/primitives['"];?/);
  if (!importMatch) return { changed: false, content };

  const rawSymbols = importMatch[1].split(',').map((s) => s.trim().replace(/\s+as\s+.+/, '')).filter(Boolean);
  const isTarget = rawSymbols.every((s) => LAYOUT_AND_ICON.has(s)) && rawSymbols.includes('Icon');
  if (!isTarget) return { changed: false, content, reason: 'Not layout+icon' };

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
    const firstImportIndex = updated.indexOf('import ');
    if (firstImportIndex !== -1) {
      updated = updated.slice(0, firstImportIndex) + newRNStatement + updated.slice(firstImportIndex);
    } else {
      updated = newRNStatement + updated;
    }
  }

  // 5. Transform Icon invocations:
  // Regex to match <Icon as={IconComponent} ... />
  updated = updated.replace(/<Icon\s+as=\{([^}]+)\}([^>]*?)\/?>/g, (match, iconComp, restProps) => {
    let cleanRest = restProps.trim();
    let sizeValue = 16;

    // Check size="sm" or size={18}
    const stringSizeMatch = cleanRest.match(/size=["']([^"']+)["']/);
    const numericSizeMatch = cleanRest.match(/size=\{([0-9]+)\}/);

    if (stringSizeMatch) {
      const named = stringSizeMatch[1];
      sizeValue = SIZE_MAP[named] || 16;
      cleanRest = cleanRest.replace(/size=["'][^"']+["']/, '').trim();
    } else if (numericSizeMatch) {
      sizeValue = parseInt(numericSizeMatch[1], 10);
      cleanRest = cleanRest.replace(/size=\{[0-9]+\}/, '').trim();
    }

    const trimmedIcon = iconComp.trim();
    return `<${trimmedIcon} size={${sizeValue}}${cleanRest ? ` ${cleanRest}` : ''} />`;
  });

  // 6. Transform Layout JSX tags
  updated = updated.replace(/<Center(\s|>)/g, '<View className="items-center justify-center"$1');
  updated = updated.replace(/<\/Center>/g, '</View>');

  // HStack
  updated = updated.replace(/<HStack(\s+className=["'])([^"']*)(["'])/g, (m, p1, p2, p3) => {
    const hasRow = p2.includes('flex-row');
    return `<View${p1}${hasRow ? p2 : `flex-row items-center ${p2}`}${p3}`;
  });
  updated = updated.replace(/<HStack(\s|>)/g, (m, p1) => {
    if (p1.startsWith(' className')) return m;
    return `<View className="flex-row items-center"${p1}`;
  });
  updated = updated.replace(/<\/HStack>/g, '</View>');

  // VStack
  updated = updated.replace(/<VStack(\s|>)/g, '<View$1');
  updated = updated.replace(/<\/VStack>/g, '</View>');

  // Box
  updated = updated.replace(/<Box(\s|>)/g, '<View$1');
  updated = updated.replace(/<\/Box>/g, '</View>');

  // Heading
  updated = updated.replace(/<Heading(\s+size=["'][^"']*["'])?/g, '<Text');
  updated = updated.replace(/<\/Heading>/g, '</Text>');

  return { changed: true, content: updated, symbols: rawSymbols };
}

// CLI Execution
function scan(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', '.next', '.expo', '__tests__', 'android', 'ios', 'archive'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...scan(full));
    } else if ((ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) && !ent.name.endsWith('.web.tsx')) {
      if (!full.includes('packages/ui/src') && !full.includes('packages\\ui\\src')) {
        results.push(full.replace(/\\/g, '/'));
      }
    }
  }
  return results;
}

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
const allFiles = ['packages', 'apps'].flatMap(scan);
let count = 0;
let totalSymbols = 0;

console.log(`\n======================================================`);
console.log(`  LAYOUT + ICON CODEMOD: ${isDryRun ? 'DRY-RUN PREVIEW' : 'LIVE EXECUTION'}`);
console.log(`======================================================\n`);

for (const f of allFiles) {
  const original = fs.readFileSync(f, 'utf8');
  const res = transformContent(original);
  if (res.changed) {
    count++;
    totalSymbols += res.symbols.length;
    console.log(`[${isDryRun ? 'DRY-RUN' : 'APPLIED'}] ${f}`);
    console.log(`  Purged symbols (${res.symbols.length}): ${res.symbols.join(', ')}`);
    if (!isDryRun) {
      try {
        fs.writeFileSync(f, res.content, 'utf8');
      } catch (err) {
        console.warn(`  [WARN] Skipped writing ${f}: ${err.message}`);
      }
    }
  }
}

console.log(`\n------------------------------------------------------`);
console.log(`Summary:`);
console.log(`  Files processed: ${count}`);
console.log(`  Total legacy imports to be purged: ${totalSymbols}`);
console.log(`  Mode: ${isDryRun ? 'DRY-RUN (no files touched)' : 'LIVE (files written)'}`);
console.log(`------------------------------------------------------\n`);
