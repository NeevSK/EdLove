import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const packagesRoot = path.join(repoRoot, 'packages');
const findings = [];
const packageStats = [];
const broadEffectImports = [];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'archives', '.git'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const packageDir = path.join(packagesRoot, entry.name);
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (!readFileSafe(packageJsonPath)) continue;

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const files = walk(packageDir);
  const indexFiles = files.filter((file) => /(^|[\\/])index\.[^./]+$/.test(file));
  const source = files.map((file) => readFileSync(file, 'utf8')).join('\n');
  for (const file of files) {
    const fileSource = readFileSync(file, 'utf8');
    if (/from\s+['"]effect['"]|import\s*\(\s*['"]effect['"]\s*\)/.test(fileSource)) {
      broadEffectImports.push(path.relative(repoRoot, file));
    }
  }
  const registrationCount = (source.match(/\.(register|use|configure)\s*\(/g) || []).length;
  const rootBarrelExports = indexFiles.reduce(
    (count, file) => count + (readFileSync(file, 'utf8').match(/export \* from/g) || []).length,
    0,
  );

  packageStats.push({
    name: pkg.name,
    sideEffects: pkg.sideEffects,
    indexFiles: indexFiles.length,
    rootBarrelExports,
    registrationCount,
  });

  if (pkg.sideEffects !== false && pkg.name?.startsWith('@repo/')) {
    findings.push(`${pkg.name}: missing sideEffects:false declaration (review before adding)`);
  }
  if (registrationCount > 0) {
    findings.push(`${pkg.name}: ${registrationCount} registration/configuration calls; do not mark blindly side-effect-free`);
  }
}

if (broadEffectImports.length > 0) {
  findings.push(
    `Broad effect imports bypass focused entry points: ${broadEffectImports.join(', ')}`,
  );
}

function readFileSafe(file) {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  packages: packageStats.sort((a, b) => b.rootBarrelExports - a.rootBarrelExports),
  broadEffectImports,
  findings,
}, null, 2));
