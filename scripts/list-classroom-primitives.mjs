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

const files = findFiles('packages/classroom', ['.ts', '.tsx']).filter(f => !f.includes('.web.tsx') && !f.includes('.web.ts'));
const list = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@repo/ui/primitives')) {
    const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@repo\/ui\/primitives['"]/);
    const primitives = match ? match[1].split(',').map(s => s.trim()).filter(Boolean) : [];
    list.push({ file, primitives });
  }
}

console.log(`Classroom files with primitives (${list.length}):`);
list.forEach(x => console.log(' ', x.file, '->', x.primitives.join(', ')));
