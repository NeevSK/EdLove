import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const searchDirs = [path.join(repoRoot, 'apps'), path.join(repoRoot, 'packages')];

const violations = [];

// Match import/export ... from '@repo/pkg/src/...' or '../../packages/pkg/src/...'
const deepImportRegex = /(?:import|export)\s+[\s\S]*?\s+from\s+['"](@repo\/[^'"]+\/src\/|(?:\.\.\/)+packages\/[^'"]+\/src\/)([^'"]+)['"]/g;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.turbo' && entry.name !== '__tests__') {
        walk(fullPath);
      }
      continue;
    }
    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;

    const source = fs.readFileSync(fullPath, 'utf8');
    let match;

    while ((match = deepImportRegex.exec(source)) !== null) {
      violations.push({
        file: path.relative(repoRoot, fullPath),
        importPath: match[1] + match[2],
        reason: 'Illegal deep package import (targeting /src/). Use public subpath export instead.',
      });
    }
  }
}

searchDirs.forEach((dir) => {
  if (fs.existsSync(dir)) walk(dir);
});

if (violations.length > 0) {
  console.error('\n❌ Deep Package Import Violations Found:');
  console.error(JSON.stringify(violations, null, 2));
  process.exitCode = 1;
} else {
  console.log('✅ Zero deep package /src/ import violations found in workspace!');
}
