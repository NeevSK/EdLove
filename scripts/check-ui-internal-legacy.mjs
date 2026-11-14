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

const files = findFiles('packages/ui/src', ['.ts', '.tsx']);
const legacyPattern = /from\s+['"](@repo\/ui\/primitives|@repo\/ui\/components\/|@repo\/ui\/theme\/Theme)['"]/;

const matches = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (legacyPattern.test(content)) {
    matches.push(file);
  }
}

console.log(`Files in packages/ui/src with legacy imports: ${matches.length}`);
matches.forEach(m => console.log(' ', m));
