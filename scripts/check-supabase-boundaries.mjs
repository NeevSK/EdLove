import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const strict = process.argv.includes('--strict');
const sourceRoots = ['packages', 'apps'];
const allowedPrefixes = [
  path.normalize('packages/core/src/adapters') + path.sep,
  path.normalize('packages/core/src/api/supabase.ts'),
];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(directory) {
  const results = [];
  if (!fs.existsSync(directory)) return results;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.turbo') continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(absolutePath));
      continue;
    }
    if (extensions.has(path.extname(entry.name))) results.push(absolutePath);
  }
  return results;
}

function isAllowed(relativePath) {
  const normalized = path.normalize(relativePath);
  return allowedPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix));
}

const findings = [];
for (const sourceRoot of sourceRoots) {
  for (const filePath of walk(path.join(repoRoot, sourceRoot))) {
    const relativePath = path.relative(repoRoot, filePath);
    if (isAllowed(relativePath)) continue;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      // Only inspect import declarations. Runtime calls on an already-injected
      // client are not boundary violations and would otherwise produce noise.
      const isImportLine =
        /^\s*import\b/.test(line) ||
        /\bfrom\s+['"]@repo\/core\/api(?:\/supabase)?['"]/.test(line) ||
        /\brequire\s*\(\s*['"]@repo\/core\/api(?:\/supabase)?['"]\s*\)/.test(line);
      if (!isImportLine) return;

      const importsRawClient =
        line.includes('__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__') ||
        /from\s+['"]@repo\/core\/api\/supabase['"]/.test(line) ||
        /require\s*\(\s*['"]@repo\/core\/api\/supabase['"]\s*\)/.test(line);
      const importsBarrelAlias =
        /from\s+['"]@repo\/core\/api['"]/.test(line) &&
        /\bsupabase\b/.test(line);

      if (importsRawClient || importsBarrelAlias) {
        findings.push({
          file: relativePath,
          line: index + 1,
          kind: importsRawClient ? 'raw-client' : 'barrel-alias',
          text: line.trim(),
        });
      }
    });
  }
}

if (findings.length === 0) {
  console.log('Supabase boundary check passed: no non-allowlisted client imports found.');
  process.exit(0);
}

console.error(`Supabase boundary check found ${findings.length} non-allowlisted import(s):`);
for (const finding of findings) {
  console.error(`- ${finding.file}:${finding.line} [${finding.kind}] ${finding.text}`);
}
console.error('\nAllowed locations: packages/core/src/adapters/** and packages/core/src/api/supabase.ts');
console.error('Move request-shaped access behind a port or Hono contract before removing an allowlist entry.');

process.exit(strict ? 1 : 0);
