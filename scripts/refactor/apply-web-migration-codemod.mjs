import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manifestPath = path.join(
  repoRoot,
  'apps',
  'gurudevi-mobile',
  'docs',
  'school_erp',
  'web-mobile-package-migration.manifest.json',
);

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function buildAdapterSource(entry) {
  const exportPath = entry.packageExport;
  const symbol = entry.packageSymbol ?? 'default';
  if (symbol === 'default') {
    return `export { default } from '${exportPath}';\n`;
  }
  return `export { ${symbol} as default } from '${exportPath}';\n`;
}

const rewrites = [];

for (const entry of manifest.entries ?? []) {
  if (!entry.adapterRequired) continue;
  if (!entry.packageExport) continue;
  const sourcePath = path.join(repoRoot, entry.source);
  const nextSource = buildAdapterSource(entry);
  rewrites.push({
    file: entry.source,
    nextSource,
    changed: !fs.existsSync(sourcePath) || fs.readFileSync(sourcePath, 'utf8') !== nextSource,
  });

  if (apply) {
    fs.writeFileSync(sourcePath, nextSource);
  }
}

console.log(JSON.stringify({ apply, rewrites }, null, 2));
