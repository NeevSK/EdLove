#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const heavyLibs = [
  'lucide-react',
  'recharts',
  'lodash',
  'moment',
  'framer-motion',
  'react-native-svg',
];

const sleekPackages = ['@repo/core', '@repo/form-builder', '@repo/mcp-client'];

console.log('📦 Shiny Auditing Bundle Leakage (Transitive Bloat)...');

const results = [];

sleekPackages.forEach((pkg) => {
  const pkgName = pkg.replace('@repo/', '');
  const pkgPath = path.join(ROOT, 'packages', pkgName);
  if (!fs.existsSync(pkgPath)) return;

  heavyLibs.forEach((lib) => {
    try {
      // Use rg to find imports of heavy libs
      const pattern = `from ['"]${lib}['"]`;
      const cmd = `rg "${pattern}" "${pkgPath}" -g "**.ts" -g "**.tsx" -g "**.js" --only-matching --with-filename`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      output
        .split('\n')
        .filter((l) => l.trim())
        .forEach((line) => {
          const [file] = line.split(':');
          results.push({
            package: pkg,
            file: path.relative(ROOT, file),
            leak: lib,
          });
        });
    } catch (_e) {
      // No matches for this lib
    }
  });
});

if (results.length === 0) {
  console.log('✅ Bundle Health: EXCELLENT. No heavy transitive leaks detected in sleek packages.');
} else {
  console.log(`\n⚠️  Found ${results.length} potential bundle leaks:\n`);
  results.forEach((r) => {
    console.log(`[BLOAT] ${r.package} -> ${r.file} includes "${r.leak}"`);
  });
  console.log(
    '\nRecommendation: Use subpath exports or dynamic imports for these heavy libraries.',
  );
}
