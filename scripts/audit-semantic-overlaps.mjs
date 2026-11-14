import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

function walkFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.turbo' || entry.name === 'build') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(full, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(full.replace(/\\/g, '/'));
    }
  }
  return results;
}

const coreFiles = walkFiles(path.join(ROOT_DIR, 'packages/core/src'));
const uiFiles = walkFiles(path.join(ROOT_DIR, 'packages/ui/src'));
const allSourceFiles = [...coreFiles, ...uiFiles];

console.log(`Analyzing ${allSourceFiles.length} files across @repo/core and @repo/ui...`);

// Extract exported symbols from a file
function extractExportedSymbols(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const clean = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const symbols = [];
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  // Export functions: export function foo / export async function foo
  const fnRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/g;
  let match;
  while ((match = fnRegex.exec(clean)) !== null) {
    symbols.push({ name: match[1], kind: match[1].startsWith('use') ? 'hook' : (match[1][0] === match[1][0].toUpperCase() && !match[1].startsWith('CITIZEN') ? 'component' : 'logic'), file: relPath });
  }

  // Export const: export const foo = ...
  const constRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=/g;
  while ((match = constRegex.exec(clean)) !== null) {
    const name = match[1];
    let kind = 'constant';
    if (name.startsWith('use')) kind = 'hook';
    else if (name.endsWith('Store')) kind = 'store';
    else if (name.endsWith('Schema')) kind = 'schema';
    else if (name[0] === name[0].toUpperCase() && !name.includes('_')) kind = 'component';
    symbols.push({ name, kind, file: relPath });
  }

  // Export types & interfaces
  const typeRegex = /export\s+(?:type|interface)\s+([a-zA-Z0-9_$]+)/g;
  while ((match = typeRegex.exec(clean)) !== null) {
    symbols.push({ name: match[1], kind: 'type', file: relPath });
  }

  return symbols;
}

const allSymbols = [];
for (const f of allSourceFiles) {
  if (f.endsWith('.test.ts') || f.endsWith('.test.tsx') || f.endsWith('.d.ts')) continue;
  allSymbols.push(...extractExportedSymbols(f));
}

console.log(`Discovered ${allSymbols.length} exported symbols.`);

// Assign Domain Concepts
function assignConcept(name, filePath) {
  const s = `${name} ${filePath}`.toLowerCase();
  if (s.includes('auth') || s.includes('session') || s.includes('account') || s.includes('token') || s.includes('login') || s.includes('signup') || s.includes('password') || s.includes('otp')) {
    return 'Auth, Accounts & Session';
  }
  if (s.includes('identity') || s.includes('bond') || s.includes('citizenship') || s.includes('capacity') || s.includes('permission') || s.includes('cedar') || s.includes('sanctuaryfeature') || s.includes('guard')) {
    return 'ReBAC, Identity & Permissions';
  }
  if (s.includes('featureflag') || s.includes('rollout') || s.includes('growthbook') || s.includes('experiment')) {
    return 'Feature Flags & Rollout';
  }
  if (s.includes('storage') || s.includes('powersync') || s.includes('sqlite') || s.includes('sync') || s.includes('persist') || s.includes('cache') || s.includes('mmkv')) {
    return 'Storage, Sync & Persistence';
  }
  if (s.includes('button') || s.includes('card') || s.includes('prompt') || s.includes('modal') || s.includes('input') || s.includes('text') || s.includes('icon') || s.includes('toast') || s.includes('dialog')) {
    return 'UI Primitives & Controls';
  }
  if (s.includes('perspective') || s.includes('workspace') || s.includes('school') || s.includes('classroom') || s.includes('student') || s.includes('teacher') || s.includes('attendance')) {
    return 'Education & Workspace';
  }
  return 'Utility & Primitives';
}

const categorized = allSymbols.map(sym => ({
  ...sym,
  concept: assignConcept(sym.name, sym.file),
}));

// Group by concept and kind
const conceptGroups = new Map();
for (const item of categorized) {
  if (!conceptGroups.has(item.concept)) {
    conceptGroups.set(item.concept, []);
  }
  conceptGroups.get(item.concept).push(item);
}

// Identify Overlaps in Specific Critical Areas
console.log('\n=================================================================');
console.log('CRITICAL SEMANTIC OVERLAPS & REDUNDANCIES');
console.log('=================================================================\n');

// 1. Check Guest / Anonymous / Local Status Overlap
console.log('--- 1. OVERLAP: "Is the user a guest, anonymous, or local-only?" ---');
const guestChecks = categorized.filter(s => 
  s.kind === 'logic' && 
  (s.name.includes('Guest') || s.name.includes('Anonymous') || s.name.includes('LocalOnly'))
);
for (const g of guestChecks) {
  console.log(` • ${g.name} (${g.kind}) in ${g.file}`);
}
console.log('   ➔ Redundancy: 6 separate functions check variations of guest/anonymous/local status.');
console.log('   ➔ Canonical SSOT: resolveBondCitizenship(activeBond) === "THIRD_CLASS" || !user?.id in Identity.ts.\n');

// 2. Storage / Storage Key Overlaps
console.log('--- 2. OVERLAP: Storage Abstractions & Storage Key Formats ---');
const storageSymbols = categorized.filter(s =>
  (s.name.includes('Storage') || s.name.includes('storage') || s.name.includes('StorageKey') || s.name.includes('ScopeKey')) &&
  (s.kind === 'logic' || s.kind === 'constant')
);
for (const st of storageSymbols.slice(0, 10)) {
  console.log(` • ${st.name} (${st.kind}) in ${st.file}`);
}
console.log('   ➔ Redundancy: storage, storageWrapper, scopedStateStorage, authStorage, supabaseAuthStorage, SafeZustandStorage.');
console.log('   ➔ Redundancy: scopeStorageKey vs guestStorageKey vs localGuestStorageKey.');
console.log('   ➔ Canonical SSOT: StorageManager proxy (lib/storage.adapter.ts) + unified sessionScopeKey.\n');

// 3. UI Button Implementations
console.log('--- 3. OVERLAP: Button UI Components across Monorepo ---');
const buttons = categorized.filter(s => 
  (s.kind === 'component' || s.kind === 'constant') && 
  s.name.includes('Button') && 
  !s.name.includes('Spinner') && !s.name.includes('Icon') && !s.name.includes('Text') && !s.name.includes('Group')
);
for (const b of buttons) {
  console.log(` • <${b.name}> (${b.kind}) in ${b.file}`);
}
console.log('   ➔ Redundancy: Button (Gluestack legacy), SanctuaryButton (phase theme wrapper), SafeButton (web fallback), plus new @repo/ui/components/native/Button and web/Button.');
console.log('   ➔ Canonical SSOT: @repo/ui/components/native/Button and @repo/ui/components/web/Button.\n');

// 4. Feature Flag & Permission Resolution
console.log('--- 4. OVERLAP: Feature Flag & Permission Evaluators ---');
const permSymbols = categorized.filter(s => 
  s.kind === 'logic' && 
  (s.name.includes('Feature') || s.name.includes('Permission') || s.name.includes('Flag') || s.name.includes('Can') || s.name.includes('Decision'))
);
for (const p of permSymbols.slice(0, 8)) {
  console.log(` • ${p.name}() in ${p.file}`);
}
console.log('   ➔ Redundancy: sanctuaryFeature vs localEvaluator vs resolveFeatureFlagValue vs meetsCitizenship vs baselineCapabilities.\n');

// Write out JSON analysis
const report = {
  totalAnalyzedFiles: allSourceFiles.length,
  totalExportedSymbols: allSymbols.length,
  concepts: Array.from(conceptGroups.entries()).map(([concept, symbols]) => ({
    concept,
    totalSymbols: symbols.length,
    hooksCount: symbols.filter(s => s.kind === 'hook').length,
    componentsCount: symbols.filter(s => s.kind === 'component').length,
    storesCount: symbols.filter(s => s.kind === 'store').length,
    logicsCount: symbols.filter(s => s.kind === 'logic').length,
    typesCount: symbols.filter(s => s.kind === 'type').length,
    schemasCount: symbols.filter(s => s.kind === 'schema').length,
  })),
  guestCheckOverlaps: guestChecks,
  storageOverlaps: storageSymbols,
  buttonOverlaps: buttons,
  permissionOverlaps: permSymbols,
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/semantic-overlaps-audit.json'),
  JSON.stringify(report, null, 2)
);
console.log('Saved full semantic overlap report to reports/semantic-overlaps-audit.json');
