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
const legacyImports = [];
for (const f of files) {
  if (f.startsWith('packages/ui/src/components/native') || f.startsWith('packages/ui/src/components/web') || f.startsWith('packages/ui/src/theme') || f.startsWith('packages\\ui\\src\\components\\native') || f.startsWith('packages\\ui\\src\\components\\web') || f.startsWith('packages\\ui\\src\\theme')) continue;
  const c = fs.readFileSync(f, 'utf8');
  const matches = c.match(/from\s+['"](@repo\/ui\/components\/|@repo\/ui\/primitives|@repo\/ui\/theme\/Theme)['"]/g);
  if (matches) {
    legacyImports.push({ file: f, count: matches.length });
  }
}
console.log('Internal packages/ui legacy importing files:', legacyImports.length);
legacyImports.sort((a,b) => b.count - a.count).slice(0, 20).forEach(x => console.log(' ', x.file, ':', x.count));
