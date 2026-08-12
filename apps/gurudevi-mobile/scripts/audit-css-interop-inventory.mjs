import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const workspaceRoot = path.resolve(appRoot, '../..');
const uiRoot = path.join(workspaceRoot, 'packages/ui');
const libraryRoot = path.join(workspaceRoot, 'packages/library');
const roots = [path.join(uiRoot, 'src/components/ui'), path.join(uiRoot, 'src/components-legacy')];

const walk = (root) => {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(fullPath);
      else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) files.push(fullPath);
    }
  }
  return files.sort();
};

const relative = (file) => path.relative(workspaceRoot, file).replaceAll(path.sep, '/');
const records = [];
const legacyConsumerFiles = [];

for (const file of roots.flatMap(walk)) {
  const source = fs.readFileSync(file, 'utf8');
  const cssInteropMatches = [...source.matchAll(/cssInterop\(([^\n]+?)(?:\n[^)]*)?\);/g)];
  const styledMatches = [...source.matchAll(/\bstyled\(([^\n)]+)/g)];
  if (!cssInteropMatches.length && !styledMatches.length) continue;

  records.push({
    file: relative(file),
    ownership: relative(file).includes('components-legacy') ? 'legacy' : 'product-owned',
    cssInteropCount: cssInteropMatches.length,
    cssInteropTargets: cssInteropMatches.map((match) => match[1].trim()),
    styledCount: styledMatches.length,
    styledTargets: styledMatches.map((match) => match[1].trim()),
  });
}

const productSourceRoots = [
  path.join(uiRoot, 'src'),
  path.join(libraryRoot, 'src'),
  path.join(appRoot, 'src'),
];
for (const file of productSourceRoots.flatMap(walk)) {
  const fileName = relative(file);
  if (fileName.includes('components-legacy/') || fileName.includes('gluestack-legacy/')) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (/components-legacy|gluestack-legacy/.test(source)) legacyConsumerFiles.push(fileName);
}

const summary = records.reduce(
  (result, record) => {
    result.files += 1;
    result.cssInterop += record.cssInteropCount;
    result.styled += record.styledCount;
    if (record.ownership === 'legacy') result.legacyFiles += 1;
    else if (record.cssInteropCount) result.productOwnedFiles += 1;
    return result;
  },
  { files: 0, cssInterop: 0, styled: 0, legacyFiles: 0, productOwnedFiles: 0 },
);

const unexpectedNewFiles = records.filter(
  (record) =>
    record.ownership === 'product-owned' &&
    record.cssInteropCount > 0 &&
    !record.file.includes('components/ui/'),
);

console.log('CSS interop source inventory');
console.log(`  files with registrations: ${summary.files}`);
console.log(`  product-owned files with cssInterop: ${summary.productOwnedFiles}`);
console.log(`  legacy files with cssInterop: ${summary.legacyFiles}`);
console.log(`  cssInterop registrations: ${summary.cssInterop}`);
console.log(`  styled() registrations: ${summary.styled}`);
console.log(`  current legacy-tree consumers: ${legacyConsumerFiles.length}`);

for (const record of records) {
  console.log(
    `  ${record.file} | ${record.ownership} | cssInterop=${record.cssInteropCount} | styled=${record.styledCount}`,
  );
}

if (process.argv.includes('--check') && unexpectedNewFiles.length) {
  console.error('\nFAIL: cssInterop exists outside the approved component roots.');
  for (const record of unexpectedNewFiles) console.error(`  ${record.file}`);
  process.exitCode = 1;
}

if (process.argv.includes('--check') && legacyConsumerFiles.length) {
  console.error('\nFAIL: current product source imports the frozen legacy UI tree.');
  for (const file of legacyConsumerFiles) console.error(`  ${file}`);
  process.exitCode = 1;
}
