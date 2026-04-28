#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const packagesDir = path.join(ROOT, 'packages');

const packages = fs
  .readdirSync(packagesDir)
  .filter(
    (p) =>
      fs.statSync(path.join(packagesDir, p)).isDirectory() &&
      fs.existsSync(path.join(packagesDir, p, 'package.json')),
  );

const report = {
  integrityViolations: [],
};

console.log('🛡️ Auditing Export Integrity...');

function checkPackage(pkg) {
  const pkgPath = path.join(packagesDir, pkg);
  const srcPath = path.join(pkgPath, 'src');
  if (!fs.existsSync(srcPath)) return;

  // 1. Find all deep imports into this package from others
  const otherPackages = packages.filter((p) => p !== pkg);

  otherPackages.forEach((other) => {
    const otherSrc = path.join(packagesDir, other, 'src');
    if (!fs.existsSync(otherSrc)) return;

    function walk(dir) {
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (['node_modules', 'dist'].includes(entry.name)) continue;
          walk(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Check for deep imports skipping index.js/ts
          const deepImportRegex = new RegExp(`from ['"]@repo/${pkg}/src/(.*)['"]`, 'g');
          let match;
          while ((match = deepImportRegex.exec(content)) !== null) {
            report.integrityViolations.push({
              consumer: `packages/${other}`,
              provider: `packages/${pkg}`,
              target: match[1],
              file: path.relative(ROOT, fullPath),
              reason: 'Deep import bypassing public barrel file (@repo/' + pkg + ')',
            });
          }
        }
      }
    }
    walk(otherSrc);
  });
}

packages.forEach(checkPackage);

if (report.integrityViolations.length === 0) {
  console.log('✅ Export Integrity: Crystal Clear. All packages respect boundaries.');
} else {
  console.log(`\n❌ Found ${report.integrityViolations.length} integrity violations:\n`);
  report.integrityViolations.forEach((v) => {
    console.log(`[LEAK] ${v.file} -> ${v.provider} (Deep target: ${v.target})`);
  });
}
