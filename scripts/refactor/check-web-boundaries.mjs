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

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const violations = [];

for (const entry of manifest.entries ?? []) {
  if (!entry.adapterRequired) continue;
  const filePath = path.join(repoRoot, entry.source);
  if (!fs.existsSync(filePath)) {
    violations.push({
      file: entry.source,
      reason: 'Adapter file does not exist.',
    });
    continue;
  }

  // Remove comments and normalize whitespace for thin adapter detection
  const source = fs.readFileSync(filePath, 'utf8').trim();
  const cleanSource = source
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('*') && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    })
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
    
  const isThinAdapter =
    /^export\s+\{\s*default\s*\}\s+from\s+['"][^'"]+['"];?$/.test(cleanSource) ||
    /^export\s+\{\s*[A-Za-z0-9_]+\s+as\s+default\s*\}\s+from\s+['"][^'"]+['"];?$/.test(cleanSource);

  if (!isThinAdapter) {
    violations.push({
      file: entry.source,
      reason: 'Adapter file is not a thin re-export.',
    });
  }
}

if (violations.length > 0) {
  console.error(JSON.stringify({ ok: false, violations }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, checked: manifest.entries.length }, null, 2));
}
