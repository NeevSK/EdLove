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

const files = findFiles('.', ['.ts', '.tsx']);
const targetPattern = /from\s+['"]@repo\/ui\/components\/BrandPulse['"]/;

const list = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (targetPattern.test(c)) {
    list.push(f);
  }
}
console.log('Files importing BrandPulse (' + list.length + '):');
list.forEach(f => console.log(' ', f));
