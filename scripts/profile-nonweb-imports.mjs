import fs from 'fs';
import path from 'path';

function findFiles(dir, exts) {
  let res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist' && entry.name !== '.turbo' && entry.name !== '.git') {
        res.push(...findFiles(full, exts));
      }
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      res.push(full);
    }
  }
  return res;
}

const files = findFiles('.', ['.ts', '.tsx']).filter(f => !f.includes('.web.tsx') && !f.includes('.web.ts') && !f.startsWith('.\\packages\\ui\\src\\primitives'));
const legacyPattern = /from\s+['"](@repo\/ui\/primitives|@repo\/ui\/components\/|@repo\/ui\/theme\/Theme)['"]/;

const matched = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (legacyPattern.test(content)) {
    const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@repo\/ui\/primitives['"]/);
    const primitives = match ? match[1].split(',').map(s => s.trim()).filter(Boolean) : [];
    matched.push({ file, primitives });
  }
}

console.log(`Total non-web files with legacy imports: ${matched.length}`);

const counts = {};
for (const m of matched) {
  for (const p of m.primitives) {
    counts[p] = (counts[p] || 0) + 1;
  }
}
console.log('Primitive frequency in non-web files:');
console.log(Object.entries(counts).sort((a,b) => b[1] - a[1]));

// Breakdown by package
const pkgCounts = {};
for (const m of matched) {
  const pkg = m.file.split(path.sep)[1] || 'root';
  pkgCounts[pkg] = (pkgCounts[pkg] || 0) + 1;
}
console.log('Package breakdown:', pkgCounts);
