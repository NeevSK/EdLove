import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const visited = new Set();
const importingRN = [];

function resolveModulePath(specifier, fromDir) {
  try {
    return require.resolve(specifier, { paths: [fromDir] });
  } catch {
    return null;
  }
}

function checkFile(filePath, chain = []) {
  let fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js', '/index.mjs']) {
      if (fs.existsSync(fullPath + ext)) {
        fullPath = fullPath + ext;
        break;
      }
    }
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return;
  } else if (fs.statSync(fullPath).isDirectory()) {
    for (const ext of ['/index.ts', '/index.tsx', '/index.js', '/index.mjs']) {
      if (fs.existsSync(fullPath + ext)) {
        fullPath = fullPath + ext;
        break;
      }
    }
    if (fs.statSync(fullPath).isDirectory()) return;
  }

  if (visited.has(fullPath)) return;
  visited.add(fullPath);

  const content = fs.readFileSync(fullPath, 'utf8');
  const importRegex = /(?:import|export)\s+(?:.+?\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importTarget = match[1] || match[2];
    if (!importTarget) continue;

    if (importTarget === 'react-native' || importTarget.startsWith('react-native/')) {
      importingRN.push({
        file: fullPath,
        target: importTarget,
        chain: [...chain, fullPath],
      });
      continue;
    }

    const dir = path.dirname(fullPath);
    if (importTarget.startsWith('@repo/core/')) {
      const rel = importTarget.replace('@repo/core/', '');
      checkFile(path.join('packages/core/src', rel), [...chain, fullPath]);
    } else if (importTarget === '@repo/core') {
      checkFile('packages/core/src/index.ts', [...chain, fullPath]);
    } else if (importTarget.startsWith('.')) {
      checkFile(path.join(dir, importTarget), [...chain, fullPath]);
    } else {
      // Third party package
      const resolved = resolveModulePath(importTarget, dir);
      if (resolved && !resolved.includes('node_modules\\typescript') && !resolved.includes('node_modules/@typescript')) {
        checkFile(resolved, [...chain, fullPath]);
      }
    }
  }
}

console.log('--- Tracing from packages/core/src/index.ts (including third-party deps) ---');
checkFile('packages/core/src/index.ts');

console.log(`\nFound ${importingRN.length} react-native import points from @repo/core:`);
for (const item of importingRN) {
  console.log(`\nImport: "${item.target}" in ${item.file}`);
  console.log('Chain:');
  item.chain.forEach((f, i) => console.log(`  ${i}: ${f}`));
}
